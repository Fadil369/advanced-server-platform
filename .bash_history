sudo apt update
apt list --upgradable
sudo apt upgrade -y
sudo passwd ubuntu
sudo reboot
ls
sudo apt update
sudo pro status
sudo pro attach
sudo apt update && sudo apt upgrade -y
sudo adduser deployuser
sudo mkdir -p /home/deployuser/.ssh
sudo cp ~/.ssh/authorized_keys /home/deployuser/.ssh/
sudo chown -R deployuser:deployuser /home/deployuser/.ssh
sudo chmod 700 /home/deployuser/.ssh && sudo chmod 600 /home/deployuser/.ssh/authorized_keys
sudo apt install ufw -y               # Install UFW if not already installed
sudo ufw default deny incoming        # Block all incoming by default
sudo ufw default allow outgoing       # Allow all outgoing traffic
sudo ufw allow 22/tcp                 # Allow SSH (adjust port if you run SSH on a non-standard port)
sudo ufw allow 80/tcp                 # Allow HTTP
sudo ufw allow 443/tcp                # Allow HTTPS
sudo ufw limit 22/tcp                 # Rate-limit SSH to mitigate brute-force
sudo ufw enable                       # Enable the firewall (you may be prompted to confirm)
sudo apt install fail2ban -y
sudo systemctl enable --now fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
sudo systemctl restart fail2ban
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
# Add Docker's official GPG key:
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
# Add the Docker apt repository:
echo   "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" |   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl status docker
sudo docker run hello-world
sudo usermod -aG docker $deployuser
docker compose version
sudo apt install -y nginx
sudo systemctl enable --now nginx
sudo nano /etc/nginx/sites-available/example.com.conf
sudo certbot --nginx -d brainsait.com -d www.brainsait.com
sudo systemctl enable --now nginx
sudo ln -s /etc/nginx/sites-available/example.com.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo rm -f /etc/nginx/sites-enabled/example.com.conf
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d brainsait.com -d www.brainsait.com
sudo apt update
sudo apt install -y certbot python3-certbot-nginx python3-certbot-dns-cloudflare
sudo mkdir -p /root/.secrets
sudo nano /root/.secrets/cf.ini
# paste this single line:
# dns_cloudflare_api_token = <YOUR_CF_API_TOKEN>
sudo chmod 600 /root/.secrets/cf.ini
sudo certbot -a dns-cloudflare   --dns-cloudflare-credentials /root/.secrets/cf.ini   --nginx   -d brainsait.com -d www.brainsait.com
curl "https://api.cloudflare.com/client/v4/user/tokens/verify"      -H "Authorization: Bearer 3HxWStvaiSkmwUJOZR7UBbBTyv6XVs-F65iBRqMl"
sudo chmod 600 /root/.secrets/cf.ini
sudo certbot -a dns-cloudflare   --dns-cloudflare-credentials /root/.secrets/cf.ini   --nginx   -d brainsait.com -d www.brainsait.com
sudo nginx -t && sudo systemctl reload nginx
sudo ln -sf /etc/nginx/sites-available/example.com.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
nano /etc/nginx/conf.d/realip.conf
sudo nano /etc/nginx/conf.d/realip.conf
sudo nginx -t && sudo systemctl reload nginx
sudo certbot certonly   --dns-cloudflare   --dns-cloudflare-credentials /root/.secrets/cf.ini   --dns-cloudflare-propagation-seconds 30   -d brainsait.com -d www.brainsait.com   -m fadil369@hotmail.com --agree-tos -n
sudo apt purge -y certbot python3-certbot-* 
sudo rm -rf /etc/letsencrypt /var/log/letsencrypt /var/lib/letsencrypt
sudo systemctl stop nginx
sudo systemctl disable nginx
sudo apt purge -y nginx nginx-common nginx-core
sudo rm -rf /etc/nginx /var/log/nginx /var/lib/nginx
sudo apt update
sudo apt upgrade -y
sudo apt update
sudo nano /etc/ssh/sshd_config
sudo systemctl restart sshd
wget https://desktop-release.q.us-east-1.amazonaws.com/latest/amazon-q.deb
sudo dpkg -i amazon-q.deb
sudo apt-get install -f
q
q login
q
ls
mkdir instructions
cd instructions
touch instruction.md
nano instruction.md
cd
q
sudo apt update
q chat
