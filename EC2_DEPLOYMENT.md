# ☁️ AWS EC2 Docker Deployment Guide

This guide walks you through deploying the complete **Student Attendance Management System** (`frontendd`, `backend`, and `database`) onto an **AWS EC2** instance using Docker & Docker Compose.

---

## 1. 🖥️ Launch an AWS EC2 Instance

1. Log into the [AWS Management Console](https://console.aws.amazon.com/ec2).
2. Click **"Launch Instance"**.
3. Configure the following settings:
   - **Name**: `student-attendance-app`
   - **OS Image (AMI)**: **Ubuntu 24.04 LTS** (or Ubuntu 22.04 LTS) / **Amazon Linux 2023**
   - **Instance Type**: `t2.micro` (Free tier eligible) or `t3.small` (Recommended for smooth Docker builds)
   - **Key Pair**: Select an existing `.pem` key pair or create a new one (e.g. `attendance-key.pem`).
4. **Network Settings / Security Group Rules**:
   Add the following **Inbound Security Group Rules**:

   | Type | Protocol | Port Range | Source | Purpose |
   |---|---|---|---|---|
   | **SSH** | TCP | `22` | My IP | Secure server terminal access |
   | **HTTP** | TCP | `80` | Anywhere (`0.0.0.0/0`) | React Web Application |
   | **Custom TCP** | TCP | `8000` | Anywhere (`0.0.0.0/0`) | FastAPI Backend & Swagger API Docs |
   | **Custom TCP** | TCP | `5173` | Anywhere (`0.0.0.0/0`) | Alternative frontend access port |

5. Click **"Launch Instance"**.

---

## 2. 🔑 Connect to your EC2 Instance via SSH

Open PowerShell or terminal on your computer and connect to your EC2 instance:

```bash
ssh -i "path/to/attendance-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```
*(If using Amazon Linux, use `ec2-user@<YOUR-EC2-PUBLIC-IP>`)*

---

## 3. 🚀 1-Command Deployment on EC2

Once connected inside your EC2 terminal, run:

```bash
# Clone the repository
git clone https://github.com/kesarsunil/studpostgragesql.git
cd studpostgragesql

# Make the deploy script executable and run it
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

### What `deploy_ec2.sh` does automatically:
1. Installs Docker and the Docker Compose plugin on Ubuntu / Amazon Linux.
2. Starts and enables the Docker system service.
3. Builds the 3 Docker containers:
   - `attendance_frontend` (React + Nginx reverse proxy)
   - `attendance_backend` (FastAPI Python)
   - `attendance_postgres` (PostgreSQL 16 with pre-loaded `init.sql`)
4. Starts the entire application stack in the background with automatic restart policies.

---

## 4. 🌐 Access Your Live Website

Once the deployment finishes, open your browser and navigate to:

- 🖥️ **Web Application**: `http://<YOUR-EC2-PUBLIC-IP>`
- ⚡ **Interactive Swagger API Docs**: `http://<YOUR-EC2-PUBLIC-IP>:8000/docs`
- 🩺 **Health Check**: `http://<YOUR-EC2-PUBLIC-IP>:8000/api/health`

---

## 5. 🛠️ Useful Docker Commands on EC2

- **Check running containers:**
  ```bash
  sudo docker ps
  ```
- **View live backend logs:**
  ```bash
  sudo docker logs -f attendance_backend
  ```
- **View PostgreSQL database logs:**
  ```bash
  sudo docker logs -f attendance_postgres
  ```
- **Restart the application:**
  ```bash
  sudo docker compose restart
  ```
- **Stop all services:**
  ```bash
  sudo docker compose down
  ```
