-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: leave_db
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '3b9bd54c-bb80-11f0-8550-40c2babe0e90:1-8057';

--
-- Table structure for table `holidays`
--

DROP TABLE IF EXISTS `holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'ชื่อวันหยุด เช่น วันปีใหม่, วันสงกรานต์',
  `date` date NOT NULL COMMENT 'วันที่หยุด (YYYY-MM-DD)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_date` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holidays`
--

LOCK TABLES `holidays` WRITE;
/*!40000 ALTER TABLE `holidays` DISABLE KEYS */;
INSERT INTO `holidays` VALUES (1,'วันขึ้นปีใหม่','2026-01-01','2026-01-12 13:38:01','2026-01-12 13:38:01'),(2,'วันมาฆบูชา','2026-03-03','2026-01-12 13:38:01','2026-01-12 13:38:01'),(3,'วันจักรี','2026-04-06','2026-01-12 13:38:01','2026-01-12 13:38:01'),(4,'วันสงกรานต์','2026-04-13','2026-01-12 13:38:01','2026-01-12 13:38:01'),(5,'วันสงกรานต์','2026-04-14','2026-01-12 13:38:01','2026-01-12 13:38:01'),(6,'วันสงกรานต์','2026-04-15','2026-01-12 13:38:01','2026-01-12 13:38:01'),(7,'วันแรงงานแห่งชาติ','2026-05-01','2026-01-12 13:38:01','2026-01-12 13:38:01'),(8,'วันฉัตรมงคล','2026-05-04','2026-01-12 13:38:01','2026-01-12 13:38:01'),(9,'วันวิสาขบูชา','2026-05-31','2026-01-12 13:38:01','2026-01-12 13:38:01'),(10,'วันเฉลิมพระชนมพรรษา พระราชินี','2026-06-03','2026-01-12 13:38:01','2026-01-12 13:38:01'),(11,'วันอาสาฬหบูชา','2026-07-29','2026-01-12 13:38:01','2026-01-12 13:38:01'),(12,'วันเข้าพรรษา','2026-07-30','2026-01-12 13:38:01','2026-01-12 13:38:01'),(13,'วันเฉลิมพระชนมพรรษา ร.10','2026-07-28','2026-01-12 13:38:01','2026-01-12 13:38:01'),(14,'วันแม่แห่งชาติ','2026-08-12','2026-01-12 13:38:01','2026-01-12 13:38:01'),(15,'วันคล้ายวันสวรรคต ร.9','2026-10-13','2026-01-12 13:38:01','2026-01-12 13:38:01'),(16,'วันปิยมหาราช','2026-10-23','2026-01-12 13:38:01','2026-01-12 13:38:01'),(17,'วันพ่อแห่งชาติ','2026-12-05','2026-01-12 13:38:01','2026-01-12 13:38:01'),(18,'วันรัฐธรรมนูญ','2026-12-10','2026-01-12 13:38:01','2026-01-12 13:38:01'),(19,'วันสิ้นปี','2026-12-31','2026-01-12 13:38:01','2026-01-12 13:38:01'),(21,'หยุดชดเชยปีใหม่','2026-01-02','2026-01-12 08:00:58','2026-01-12 08:00:58');
/*!40000 ALTER TABLE `holidays` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-11 14:42:50
