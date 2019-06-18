CREATE DATABASE IF NOT EXISTS `mysqlantsqltest`;
CREATE DATABASE IF NOT EXISTS `mysql2antsqltest`;

CREATE USER IF NOT EXISTS 'antuser'@'%' IDENTIFIED BY 'antpassword';

GRANT ALL PRIVILEGES ON * . * TO 'antuser'@'%';
FLUSH PRIVILEGES;