CREATE DATABASE  IF NOT EXISTS `fixpath_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `fixpath_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: fixpath_db
-- ------------------------------------------------------
-- Server version	8.0.45

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

--
-- Table structure for table `consultation`
--

DROP TABLE IF EXISTS `consultation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultation` (
  `ConsultationID` int NOT NULL AUTO_INCREMENT,
  `ResultID` int NOT NULL,
  `UserID` int NOT NULL,
  `ExpertID` int NOT NULL,
  `RequestType` varchar(50) DEFAULT NULL,
  `ConsultationStatus` varchar(50) NOT NULL,
  `RequestDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ConsultationDate` datetime DEFAULT NULL,
  `ConsultationNotes` text,
  `MeetingLink` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ConsultationID`),
  KEY `ResultID` (`ResultID`),
  KEY `UserID` (`UserID`),
  KEY `ExpertID` (`ExpertID`),
  CONSTRAINT `consultation_ibfk_1` FOREIGN KEY (`ResultID`) REFERENCES `decision_result` (`ResultID`),
  CONSTRAINT `consultation_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `consultation_ibfk_3` FOREIGN KEY (`ExpertID`) REFERENCES `expert` (`ExpertID`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `decision_result`
--

DROP TABLE IF EXISTS `decision_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `decision_result` (
  `ResultID` int NOT NULL AUTO_INCREMENT,
  `ReportID` int NOT NULL,
  `RuleID` int DEFAULT NULL,
  `Outcome` varchar(100) NOT NULL,
  `Recommendation` text,
  `ResultDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `RiskLevel` varchar(50) DEFAULT NULL,
  `Confidence` decimal(6,2) DEFAULT NULL,
  `Explanation` text,
  `RequiresExpert` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ResultID`),
  KEY `ReportID` (`ReportID`),
  KEY `RuleID` (`RuleID`),
  CONSTRAINT `decision_result_ibfk_1` FOREIGN KEY (`ReportID`) REFERENCES `problem_report` (`ReportID`),
  CONSTRAINT `decision_result_ibfk_2` FOREIGN KEY (`RuleID`) REFERENCES `decision_rule` (`RuleID`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `decision_rule`
--

DROP TABLE IF EXISTS `decision_rule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `decision_rule` (
  `RuleID` int NOT NULL AUTO_INCREMENT,
  `DeviceID` int NOT NULL,
  `OutcomeType` varchar(100) NOT NULL,
  `GuidanceText` text,
  `RiskLevel` varchar(50) DEFAULT NULL,
  `Priority` int DEFAULT NULL,
  `RequiresExpert` tinyint(1) DEFAULT '0',
  `IsActive` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`RuleID`),
  KEY `DeviceID` (`DeviceID`),
  CONSTRAINT `decision_rule_ibfk_1` FOREIGN KEY (`DeviceID`) REFERENCES `device` (`DeviceID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device` (
  `DeviceID` int NOT NULL AUTO_INCREMENT,
  `CategoryID` int NOT NULL,
  `DeviceName` varchar(100) NOT NULL,
  `Manufacturer` varchar(100) DEFAULT NULL,
  `Model` varchar(100) DEFAULT NULL,
  `DeviceDescription` text,
  PRIMARY KEY (`DeviceID`),
  KEY `CategoryID` (`CategoryID`),
  CONSTRAINT `device_ibfk_1` FOREIGN KEY (`CategoryID`) REFERENCES `device_category` (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `device_category`
--

DROP TABLE IF EXISTS `device_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_category` (
  `CategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(100) NOT NULL,
  `CategoryDescription` text,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expert`
--

DROP TABLE IF EXISTS `expert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expert` (
  `ExpertID` int NOT NULL AUTO_INCREMENT,
  `ExpertName` varchar(100) NOT NULL,
  `ServiceType` varchar(100) DEFAULT NULL,
  `Phone` varchar(50) DEFAULT NULL,
  `ExpertEmail` varchar(150) DEFAULT NULL,
  `ExpertRating` decimal(2,1) DEFAULT NULL,
  `AvailabilityStatus` varchar(50) NOT NULL,
  `PasswordHash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ExpertID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `FeedbackID` int NOT NULL AUTO_INCREMENT,
  `ReportID` int DEFAULT NULL,
  `UserID` int NOT NULL,
  `FeedbackType` enum('consultation','diagnosis') NOT NULL,
  `Comments` text,
  `Rating` int DEFAULT NULL,
  `SubmittedDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ConsultationID` int DEFAULT NULL,
  `ResultID` int DEFAULT NULL,
  `ExpertID` int DEFAULT NULL,
  PRIMARY KEY (`FeedbackID`),
  KEY `ReportID` (`ReportID`),
  KEY `fk_feedback_user` (`UserID`),
  KEY `fk_feedback_consultation` (`ConsultationID`),
  KEY `fk_feedback_expert` (`ExpertID`),
  KEY `fk_feedback_result` (`ResultID`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`ReportID`) REFERENCES `problem_report` (`ReportID`),
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `fk_feedback_consultation` FOREIGN KEY (`ConsultationID`) REFERENCES `consultation` (`ConsultationID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_feedback_expert` FOREIGN KEY (`ExpertID`) REFERENCES `expert` (`ExpertID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_feedback_result` FOREIGN KEY (`ResultID`) REFERENCES `decision_result` (`ResultID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_feedback_user` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `merchant`
--

DROP TABLE IF EXISTS `merchant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `merchant` (
  `MerchantID` int NOT NULL AUTO_INCREMENT,
  `MerchantName` varchar(100) NOT NULL,
  `Website` varchar(255) DEFAULT NULL,
  `ContactEmail` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`MerchantID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `problem_report`
--

DROP TABLE IF EXISTS `problem_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_report` (
  `ReportID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `DeviceID` int NOT NULL,
  `ReportDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ProblemDescription` text NOT NULL,
  `DetectedRiskLevel` varchar(50) DEFAULT NULL,
  `Status` varchar(50) DEFAULT NULL,
  `MediaURL` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ReportID`),
  KEY `UserID` (`UserID`),
  KEY `DeviceID` (`DeviceID`),
  CONSTRAINT `problem_report_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `user` (`UserID`),
  CONSTRAINT `problem_report_ibfk_2` FOREIGN KEY (`DeviceID`) REFERENCES `device` (`DeviceID`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `problem_report_symptom`
--

DROP TABLE IF EXISTS `problem_report_symptom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_report_symptom` (
  `ReportID` int NOT NULL,
  `SymptomID` int NOT NULL,
  `Notes` text,
  PRIMARY KEY (`ReportID`,`SymptomID`),
  KEY `SymptomID` (`SymptomID`),
  CONSTRAINT `problem_report_symptom_ibfk_1` FOREIGN KEY (`ReportID`) REFERENCES `problem_report` (`ReportID`),
  CONSTRAINT `problem_report_symptom_ibfk_2` FOREIGN KEY (`SymptomID`) REFERENCES `symptom` (`SymptomID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `replacement_option`
--

DROP TABLE IF EXISTS `replacement_option`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `replacement_option` (
  `OptionID` int NOT NULL AUTO_INCREMENT,
  `RuleID` int DEFAULT NULL,
  `MerchantID` int NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `ProductType` varchar(100) DEFAULT NULL,
  `EstimatedPrice` decimal(10,2) DEFAULT NULL,
  `ProductURL` varchar(255) DEFAULT NULL,
  `DeviceID` int DEFAULT NULL,
  PRIMARY KEY (`OptionID`),
  KEY `RuleID` (`RuleID`),
  KEY `MerchantID` (`MerchantID`),
  KEY `fk_replacement_device` (`DeviceID`),
  CONSTRAINT `fk_replacement_device` FOREIGN KEY (`DeviceID`) REFERENCES `device` (`DeviceID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `replacement_option_ibfk_1` FOREIGN KEY (`RuleID`) REFERENCES `decision_rule` (`RuleID`),
  CONSTRAINT `replacement_option_ibfk_2` FOREIGN KEY (`MerchantID`) REFERENCES `merchant` (`MerchantID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_media`
--

DROP TABLE IF EXISTS `report_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_media` (
  `MediaID` int NOT NULL AUTO_INCREMENT,
  `ReportID` int NOT NULL,
  `MediaType` varchar(20) NOT NULL,
  `MediaURL` varchar(255) NOT NULL,
  `UploadedTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MediaID`),
  KEY `ReportID` (`ReportID`),
  CONSTRAINT `report_media_ibfk_1` FOREIGN KEY (`ReportID`) REFERENCES `problem_report` (`ReportID`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rule_symptom`
--

DROP TABLE IF EXISTS `rule_symptom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rule_symptom` (
  `RuleID` int NOT NULL,
  `SymptomID` int NOT NULL,
  PRIMARY KEY (`RuleID`,`SymptomID`),
  KEY `SymptomID` (`SymptomID`),
  CONSTRAINT `rule_symptom_ibfk_1` FOREIGN KEY (`RuleID`) REFERENCES `decision_rule` (`RuleID`),
  CONSTRAINT `rule_symptom_ibfk_2` FOREIGN KEY (`SymptomID`) REFERENCES `symptom` (`SymptomID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `symptom`
--

DROP TABLE IF EXISTS `symptom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `symptom` (
  `SymptomID` int NOT NULL AUTO_INCREMENT,
  `SymptomName` varchar(100) NOT NULL,
  `SymptomDescription` text,
  `SeverityLevel` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`SymptomID`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `CreatedTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-03 13:13:20
