#!/bin/bash
# AWS EC2 Setup Script for Chocolate Lead Engine
# Run this on a fresh Ubuntu EC2 t2.micro instance

set -e

echo "=== Chocolate Lead Engine - EC2 Setup ==="

# Update system
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker
echo "[2/5] Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
echo "[3/5] Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
echo "[4/5] Setting up application directory..."
sudo mkdir -p /opt/chocolate
sudo chown $USER:$USER /opt/chocolate

echo "[5/5] Setup complete!"
echo ""
echo "=== NEXT STEPS ==="
echo "1. Copy your project files to /opt/chocolate/"
echo "2. Create .env file with your secrets:"
echo "   cd /opt/chocolate && nano .env"
echo "   (Add: GEMINI_API_KEY=xxx and DISCORD_WEBHOOK=xxx)"
echo "3. Build and run:"
echo "   cd /opt/chocolate && docker-compose up -d --build"
echo "4. Check logs:"
echo "   docker-compose logs -f"
echo ""
echo "Done! Log out and back in for docker group to take effect."
