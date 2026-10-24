-- Larimar's first community: a general one for everything. Game and app
-- communities stay on Juxt; more Larimar communities come from the staff page.
-- Apply once: sudo mariadb larimar < migrations/003_general_community.sql

INSERT INTO `communities`
  (`olive_title_id`, `olive_community_id`, `type`, `hidden`, `icon`, `banner`, `banner_3ds`,
   `name`, `description`, `category`, `title_ids`, `platform`, `sort_order`)
VALUES
  ('1', '1', 0, 0,
   '/img/larimar/general-icon.png', '/img/larimar/general-banner-wiiu.jpg', '/img/larimar/general-banner-3ds.jpg',
   'General', 'Talk about anything with everyone on Larimar.', 'chat', '[]', NULL, 0);
