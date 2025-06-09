
DROP TABLE IF EXISTS `user_credentials`;
DROP TABLE IF EXISTS `media_items`;
DROP TABLE IF EXISTS `media_sources`;
DROP TABLE IF EXISTS `users`;


CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `googleid` varchar(255) DEFAULT NULL,
  `liveid` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `user_credentials` (
  `user_id` bigint(20) NOT NULL,
  `credential_id` varchar(255) NOT NULL,
  `public_key` varchar(255) NOT NULL,
  `counter` bigint(20) NOT NULL DEFAULT 0,
  `transports` JSON NOT NULL,
  PRIMARY KEY (`user_id`, `credential_id`),
  CONSTRAINT fk_user_credentials_user_id FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `media_sources` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `path` varchar(255) NOT NULL,
  `last_scan` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_media_sources_user_id FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `media_items` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `media_source_id` bigint(20) NOT NULL,
  `root` varchar(512) NOT NULL,
  `path` varchar(512) NOT NULL,
  `basename` varchar(255) NOT NULL,
  `type` varchar(5) NOT NULL,
  `signature` varchar(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `metadata` JSON NULL,
  `metadata_ts` TIMESTAMP DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_media_items_user_id FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_media_items_media_source_id FOREIGN KEY (`media_source_id`) REFERENCES `media_sources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);


INSERT INTO `users` (`username`, `firstname`, `lastname`) VALUES ('correo@davidpascual.com', 'David', 'Pascual');

INSERT INTO `media_sources` (`user_id`, `path`) VALUES (1, '/home/david/MyPhoto');