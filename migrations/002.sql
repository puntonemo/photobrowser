ALTER TABLE `media_items` 
    ADD location_label varchar(255) DEFAULT NULL,
    ADD location_country_name varchar(255) DEFAULT NULL,
    ADD location_state varchar(255) DEFAULT NULL,
    ADD location_county varchar(255) DEFAULT NULL,
    ADD location_city varchar(255) DEFAULT NULL,
    ADD location_district varchar(255) DEFAULT NULL,
    ADD location_street varchar(255) DEFAULT NULL,
    ADD location_house_number varchar(255) DEFAULT NULL,
    ADD location_postal_code varchar(255) DEFAULT NULL,
    ADD location_latitude float DEFAULT NULL,
    ADD location_longitude float DEFAULT NULL,
    ADD location_ts TIMESTAMP DEFAULT NULL;

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