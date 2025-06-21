ALTER TABLE `media_items` 
    ADD `location_label` varchar(255) DEFAULT NULL,
    ADD `location_country_name` varchar(255) DEFAULT NULL,
    ADD `location_state` varchar(255) DEFAULT NULL,
    ADD `location_county` varchar(255) DEFAULT NULL,
    ADD `location_city` varchar(255) DEFAULT NULL,
    ADD `location_district` varchar(255) DEFAULT NULL,
    ADD `location_street` varchar(255) DEFAULT NULL,
    ADD `location_house_number` varchar(255) DEFAULT NULL,
    ADD `location_postal_code` varchar(255) DEFAULT NULL,
    ADD `location_latitude` double DEFAULT NULL,
    ADD `location_longitude` double DEFAULT NULL,
    ADD `location_ts` TIMESTAMP DEFAULT NULL;

CREATE TABLE `media_item_tags` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `media_item_id` bigint(20) NOT NULL,
    `tag` varchar(255) NOT NULL,
    `tag_type` varchar(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_by` bigint(20) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT fk_media_items_media_item_id FOREIGN KEY (`media_item_id`) REFERENCES `media_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_media_items_media_user_id FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `media_albums` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `description` varchar(512) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_by` bigint(20) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT fk_media_albums_created_by FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `user_media_albums` (
    `user_id` bigint(20) NOT NULL,
    `media_album_id` bigint(20) NOT NULL,
    `role` varchar(24) NOT NULL,
    PRIMARY KEY (`user_id`, `media_album_id`),
    CONSTRAINT fk_user_media_albums_user_id FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_media_albums_media_album_id FOREIGN KEY (`media_album_id`) REFERENCES `media_albums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `media_album_items` (
    `media_album_id` bigint(20) NOT NULL,
    `media_item_id` bigint(20) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_by` bigint(20) NOT NULL,
    PRIMARY KEY (`media_album_id`, `media_item_id`),
    CONSTRAINT fk_media_album_items_media_album_id FOREIGN KEY (`media_album_id`) REFERENCES `media_albums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_media_album_items_media_item_id FOREIGN KEY (`media_item_id`) REFERENCES `media_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_media_album_items_created_by FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE VIEW v_user_albums AS
	SELECT media_albums.*, user_media_albums.role "role" FROM user_media_albums
		INNER JOIN media_albums ON user_media_albums.media_album_id = media_albums.id;


ALTER TABLE `media_items`
  ADD `file_size` bigint(20) NULL AFTER `metadata`,
  ADD `file_size_string` varchar(128) NULL AFTER `file_size`,
  ADD `moment_ts` TIMESTAMP NULL AFTER `file_size_string`,
  ADD `moment_year` varchar(4) NULL AFTER `moment_ts`,
  ADD `moment_month` varchar(2) NULL AFTER `moment_year`,
  ADD `moment_day` varchar(2) NULL AFTER `moment_month`;

ALTER TABLE `users`
  ADD `profile` JSON NULL;

ALTER TABLE `media_sources`
  ADD `media_album_id` bigint(20) NOT NULL,
  ADD CONSTRAINT fk_media_sources_media_album_id FOREIGN KEY (`media_album_id`) REFERENCES `media_albums`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `media_items`
  ADD `location_country_code` varchar(10) NULL AFTER `location_label`,
  ADD `location` JSON NULL AFTER `metadata_ts`
  ADD `location_status` varchar(255) NULL AFTER `location`;

