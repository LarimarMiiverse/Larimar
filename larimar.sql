-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 01 mai 2026 à 15:37
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `larimar`
--

-- --------------------------------------------------------

--
-- Structure de la table `accounts`
--

CREATE TABLE `accounts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pid` bigint(20) NOT NULL,
  `screen_name` varchar(30) NOT NULL,
  `user_id` varchar(32) DEFAULT NULL,
  `password` text CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `email` varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `official_user` int(8) DEFAULT NULL,
  `permissions` smallint(6) DEFAULT 0,
  `access_mode` smallint(6) DEFAULT 0,
  `service_token_3ds` varchar(64) DEFAULT NULL,
  `service_token_wiiu` varchar(64) DEFAULT NULL,
  `language` varchar(8) DEFAULT 'en',
  `country` varchar(2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `accounts`
--

INSERT INTO `accounts` (`id`, `pid`, `screen_name`, `user_id`, `password`, `email`, `official_user`, `permissions`, `access_mode`, `service_token_3ds`, `service_token_wiiu`, `language`, `country`, `created_at`, `updated_at`) VALUES
(1, 1, 'cedkeChat01', 'cedkeChat', '', NULL, 0, 0, 0, 'QE43lQQ/ozrnH7+C3hpcYfGnSAGUD+DMx3kQucwkyrkvrsrC', 'QE43lQQ/ozrnH7+C3hpcYfGnSAGUD+DMx3kQucwkyrkvrsrC', 'fr', 'FR', '2026-05-01 10:26:28', '2026-05-01 10:26:28');

-- --------------------------------------------------------

--
-- Structure de la table `communities`
--

CREATE TABLE `communities` (
  `olive_title_id` varchar(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `olive_community_id` varchar(20) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `community_id` int(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `type` int(2) NOT NULL,
  `min_perm` int(2) NOT NULL DEFAULT 0,
  `allowed_pids` text DEFAULT NULL,
  `hidden` int(2) DEFAULT NULL,
  `icon` mediumtext CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `banner` mediumtext CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `banner_3ds` mediumtext CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `comment` text CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Déchargement des données de la table `communities`
--

INSERT INTO `communities` (`olive_title_id`, `olive_community_id`, `community_id`, `created_at`, `type`, `min_perm`, `allowed_pids`, `hidden`, `icon`, `banner`, `banner_3ds`, `name`, `description`, `comment`) VALUES
('1', '1', 1, '2026-05-01 12:57:20', 1, 0, NULL, 0, NULL, NULL, NULL, 'TEST', 'TEST', 'TEST');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pid` (`pid`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
