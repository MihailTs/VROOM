provider "aws" {
  region = "eu-central-1"
}

data "external" "home" {
  program = ["sh", "-c", "echo '{\"value\":\"'$HOME'\"}'"]
}

resource "aws_key_pair" "ansible_key_pair" {
  key_name   = "ansible_key_pair"
  public_key = tls_private_key.ansible_key.public_key_openssh
}

resource "aws_instance" "webservers" {
  ami           = "ami-07eef52105e8a2059"
  instance_type = "t2.micro"
  security_groups = [ aws_security_group.allow_web_traffic.name ]
  key_name = aws_key_pair.ansible_key_pair.key_name
  user_data = file("${path.module}/user_data.sh")

  tags = {
    Name = "web1"
    Role = "webserver"
    Public = "true"
  }
}


resource "aws_security_group" "allow_web_traffic" {
  name        = "allow_web_traffic"
  description = "Allow inbound web traffic"

  ingress {
    description = "TLS from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "TLS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "TLS from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_web_traffic"
  }
}

output webservers {
  value = aws_instance.webservers.*.public_dns
}