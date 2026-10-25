#!/usr/bin/env bash
# ==============================================================================
# Automated Docker & Fullstack Deployment Script for AWS EC2
# Supported OS: Ubuntu 20.04 / 22.04 / 24.04, Amazon Linux 2023 / 2
# ==============================================================================

set -e

echo "========================================================"
echo "🚀 Starting AWS EC2 Fullstack Docker Deployment"
echo "========================================================"

# 1. Detect OS and Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not found. Installing Docker..."
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [[ "$ID" == "ubuntu" || "$ID_LIKE" == *"ubuntu"* || "$ID" == "debian" ]]; then
            sudo apt-get update -y
            sudo apt-get install -y ca-certificates curl gnupg lsb-release
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            echo \
              "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
              $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update -y
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        elif [[ "$ID" == "amzn" || "$ID" == "almalinux" || "$ID" == "centos" || "$ID" == "rhel" ]]; then
            sudo dnf update -y || sudo yum update -y
            sudo dnf install -y docker || sudo yum install -y docker
            sudo systemctl enable docker
            sudo systemctl start docker
            # Install docker compose plugin
            sudo mkdir -p /usr/local/lib/docker/cli-plugins
            sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) -o /usr/local/lib/docker/cli-plugins/docker-compose
            sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
        fi
    fi

    # Start and enable Docker service
    sudo systemctl enable docker || true
    sudo systemctl start docker || true

    # Add current user to docker group
    sudo usermod -aG docker $USER || true
    echo "✓ Docker installed successfully!"
else
    echo "✓ Docker is already installed."
fi

# Ensure docker service is running
sudo systemctl start docker || true

echo "--------------------------------------------------------"
echo "🔨 Building and Starting Multi-Container Docker Stack..."
echo "--------------------------------------------------------"

# 2. Build and run containers in detached mode
if docker compose version &> /dev/null; then
    sudo docker compose down --remove-orphans || true
    sudo docker compose build --no-cache
    sudo docker compose up -d
else
    sudo docker-compose down --remove-orphans || true
    sudo docker-compose build --no-cache
    sudo docker-compose up -d
fi

echo "--------------------------------------------------------"
echo "⏳ Waiting for services to become healthy..."
echo "--------------------------------------------------------"
sleep 15

# 3. Check container status
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Get public IP if running on AWS EC2
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)
if [ -n "$TOKEN" ]; then
    PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)
else
    PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "your-ec2-public-ip")
fi

echo "========================================================"
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "========================================================"
echo "🌐 Frontend Portal: http://$PUBLIC_IP"
echo "⚡ Backend API:     http://$PUBLIC_IP:8000"
echo "📑 Swagger Docs:    http://$PUBLIC_IP:8000/docs"
echo "🗄️ PostgreSQL Port: 5432 (Internal attendance_net)"
echo "========================================================"
