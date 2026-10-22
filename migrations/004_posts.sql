-- Posts: text and/or a handwritten memo (PNG in media/paintings/<id>.png).
-- Apply once: sudo mariadb larimar < migrations/004_posts.sql

CREATE TABLE `posts` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `community_id` int(11) NOT NULL,
  `pid` bigint(20) NOT NULL,
  `body` text DEFAULT NULL,
  `painting` varchar(255) DEFAULT NULL,
  `spoiler` tinyint NOT NULL DEFAULT 0,
  `deleted` tinyint NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `community_created` (`community_id`, `created_at`),
  KEY `pid_created` (`pid`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
