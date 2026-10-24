-- User pages: profile comment, game experience and follows.
-- Apply once: sudo mariadb larimar < migrations/001_profiles_follows.sql

ALTER TABLE `accounts`
  ADD COLUMN `profile_comment` varchar(400) DEFAULT NULL,
  -- 0 = beginner, 1 = intermediate, 2 = expert, NULL = not set
  ADD COLUMN `game_skill` tinyint DEFAULT NULL;

CREATE TABLE `follows` (
  `follower_pid` bigint(20) NOT NULL,
  `followee_pid` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`follower_pid`, `followee_pid`),
  KEY `followee_pid` (`followee_pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
