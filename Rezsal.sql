-- MySQL dump 10.13  Distrib 8.0.15, for macos10.14 (x86_64)
--
-- Host: localhost    Database: Rezsal
-- ------------------------------------------------------
-- Server version	8.0.15

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8mb4 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


--
-- Table structure for table `Sale`
--

DROP TABLE IF EXISTS `Sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `Sale` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rodzaj` varchar(30) NOT NULL,
  `numersali` varchar(30) NOT NULL,
  `liczbamiejsc` int(11) NOT NULL,
  `ostatniarez` varchar(10) DEFAULT NULL,
  `cena` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numersali` (`numersali`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sale`
--

LOCK TABLES `Sale` WRITE;
/*!40000 ALTER TABLE `Sale` DISABLE KEYS */;
INSERT INTO `Sale` VALUES (9,'Aula','1',550,'9.5',250),(12,'Sala z laptopami','2',20,'9.2',150),(10,'Sala owalna',3,20,2019-12-10,200);
/*!40000 ALTER TABLE `Sale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rezerwacja`
--


DROP TABLE IF EXISTS `Rezerwacja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `Rezerwacja` (
  `rezID` int(11) NOT NULL AUTO_INCREMENT,
  `salaID` int(11) DEFAULT NULL,
  `userID` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_price` int(11) NOT NULL,
  `confirmed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`rezID`),
  KEY `salaID` (`salaID`),
  KEY `userID` (`userID`),
  CONSTRAINT `rents_ibfk_1` FOREIGN KEY (`salaID`) REFERENCES `sale` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rents_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rezerwacja`
--

LOCK TABLES `Rezerwacja` WRITE;
/*!40000 ALTER TABLE `Rezerwacja` DISABLE KEYS */;
INSERT INTO `Rezerwacja` VALUES (1,9,1,'2019-05-09','2019-05-15',0,0),(2,NULL,1,'2019-05-02','2019-05-21',0,0),(3,9,1,'2019-05-16','2019-05-24',0,0),(4,9,1,'2019-05-30','2019-06-01',0,0),(5,9,1,'2019-05-27','2019-05-29',0,1),(6,9,1,'2019-05-25','2019-05-26',20,0),(7,9,9,'2019-06-13','2019-06-19',60,0),(8,12,1,'2019-05-23','2019-05-30',480,0),(9,9,1,'2019-06-21','2019-06-28',2000,0);
/*!40000 ALTER TABLE `Rezerwacja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(30) NOT NULL,
  `password` varchar(30) NOT NULL,
  `firstname` varchar(30) DEFAULT NULL,
  `lastname` varchar(30) DEFAULT NULL,
  `adminpriv` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'admin@admin','admin','admin','admin',1),(9,'c@c.pl','c',NULL,NULL,0);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-05-19 23:36:07
