-- Communities for a general-purpose Miiverse: every community belongs to a
-- topic category; game title IDs are optional.
-- Apply once: sudo mariadb larimar < migrations/002_communities.sql

-- The creator's placeholder row
DELETE FROM `communities` WHERE `olive_community_id` = '1' AND `name` = 'TEST';

ALTER TABLE `communities`
  MODIFY `community_id` int(11) NOT NULL AUTO_INCREMENT,
  ADD PRIMARY KEY (`community_id`),
  ADD UNIQUE KEY `olive_community_id` (`olive_community_id`),
  -- games, creative, music, chat, apps, news (src/categories.js)
  ADD COLUMN `category` varchar(16) NOT NULL DEFAULT 'chat',
  -- JSON array of title IDs; empty for communities not tied to a game
  ADD COLUMN `title_ids` text DEFAULT NULL,
  -- NULL = not a game community, 0 = Wii U, 1 = 3DS, 2 = both
  ADD COLUMN `platform` tinyint DEFAULT NULL,
  ADD COLUMN `sort_order` int NOT NULL DEFAULT 0;

CREATE TABLE `community_favorites` (
  `pid` bigint(20) NOT NULL,
  `community_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`pid`, `community_id`),
  KEY `community_id` (`community_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
