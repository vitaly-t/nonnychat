CREATE DATABASE nonnychat;
CREATE USER nonnychat IDENTIFIED BY 'nonnychat';
GRANT ALL PRIVILEGES ON nonnychat.* TO nonnychat;

/*
CREATE TABLE IF NOT EXISTS nonnychat_messages (
		id int not null auto_increment primary key
		, username varchar(50)
		, roomname varchar(200)
		, messagetext text 
		, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
*/
