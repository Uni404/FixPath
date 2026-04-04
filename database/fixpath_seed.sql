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
-- Dumping data for table `decision_rule`
--

LOCK TABLES `decision_rule` WRITE;
/*!40000 ALTER TABLE `decision_rule` DISABLE KEYS */;
INSERT INTO `decision_rule` VALUES (1,1,'low-risk troubleshooting','Check and clean the filter, empty the dustbin, and inspect the hose for blockages.','Low',3,0,1),(2,2,'emergency stop','Stop using the heater immediately and contact a professional.','High',1,1,1),(3,3,'expert consultation','Request professional help to inspect the leak.','Medium',1,1,1),(4,2,'expert consultation','Check the power cable first. If the issue remains, contact an expert.','Medium',2,1,1),(5,1,'expert consultation','The vacuum cleaner may have internal blockage or motor issues. Please request expert support.','Medium',1,1,1),(6,1,'stop and inspect','Stop using the vacuum cleaner and allow it to cool down before further inspection.','High',2,0,1),(7,3,'low-risk troubleshooting','Try cleaning the drain using a safe drain-cleaning method.','Low',3,0,1),(8,3,'replace part','The faucet may require a replacement seal or cartridge.','Low',2,0,1);
/*!40000 ALTER TABLE `decision_rule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `device`
--

LOCK TABLES `device` WRITE;
/*!40000 ALTER TABLE `device` DISABLE KEYS */;
INSERT INTO `device` VALUES (1,1,'Vacuum Cleaner','Dyson','V8','Cordless vacuum cleaner'),(2,2,'Heater','Honeywell','H100','Portable electric heater'),(3,3,'Sink','Delta','S200','Standard household sink'),(4,1,'Steam Cleaner','CleanPro','SC-100','Household steam cleaning device'),(5,2,'Air Purifier','FreshAir','AP-200','Indoor air purification device'),(6,3,'Faucet','AquaFlow','FC-10','Bathroom or kitchen faucet fixture');
/*!40000 ALTER TABLE `device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `device_category`
--

LOCK TABLES `device_category` WRITE;
/*!40000 ALTER TABLE `device_category` DISABLE KEYS */;
INSERT INTO `device_category` VALUES (1,'Cleaning Equipment','Home cleaning devices'),(2,'Home Appliance','Household electrical appliances'),(3,'Plumbing Fixture','Bathroom or kitchen water fixtures');
/*!40000 ALTER TABLE `device_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `expert`
--

LOCK TABLES `expert` WRITE;
/*!40000 ALTER TABLE `expert` DISABLE KEYS */;
INSERT INTO `expert` VALUES (1,'alex chen','Electrical Appliance Support','098766431231','alex@example.com',3.2,'Available','$2b$10$vSplsLvH1nFBK5QKM9uvQeOpOz7uXVIND0biI/tr3WhAeeVIX7c3S'),(2,'Sarah Liu','Home Fixture Support','234-567-8901','sarah@example.com',4.7,'Busy','$2b$10$gAZz79GqnMuqaGQzA7ymSusqqeklYuF0rN0F2K3q.HmIuY32jnDu2');
/*!40000 ALTER TABLE `expert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `merchant`
--

LOCK TABLES `merchant` WRITE;
/*!40000 ALTER TABLE `merchant` DISABLE KEYS */;
INSERT INTO `merchant` VALUES (1,'Amazon','https://www.amazon.com','support@amazon.com'),(2,'Best Buy','https://www.bestbuy.com','support@bestbuy.com'),(3,'Home Depot','https://www.homedepot.ca','support@hdepot.com');
/*!40000 ALTER TABLE `merchant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `replacement_option`
--

LOCK TABLES `replacement_option` WRITE;
/*!40000 ALTER TABLE `replacement_option` DISABLE KEYS */;
INSERT INTO `replacement_option` VALUES (1,2,1,'Portable Electric Heater 1500W','Heater',59.99,'https://amazon.ca/heater1',2),(2,2,1,'Oil-Filled Radiator Heater','Heater',89.99,'https://amazon.ca/heater2',2),(3,2,2,'Energy Efficient Ceramic Heater','Heater',79.99,'https://bestbuy.ca/heater1',2),(4,2,2,'Smart WiFi Heater with Safety Shutoff','Heater',129.99,'https://bestbuy.ca/heater2',2),(5,2,3,'Heavy Duty Garage Heater','Heater',149.99,'https://homedepot.ca/heater1',2),(6,2,3,'Wall Mounted Heater System','Heater',199.99,'https://homedepot.ca/heater2',2),(7,8,1,'Universal Faucet Cartridge Kit','Replacement Part',18.99,'https://amazon.ca/faucet-cartridge',6),(8,8,2,'Sink Seal Replacement Pack','Replacement Part',12.99,'https://bestbuy.ca/sink-seal',3),(9,8,3,'Drain Repair Component Set','Replacement Part',24.99,'https://homedepot.ca/drain-repair',NULL);
/*!40000 ALTER TABLE `replacement_option` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `rule_symptom`
--

LOCK TABLES `rule_symptom` WRITE;
/*!40000 ALTER TABLE `rule_symptom` DISABLE KEYS */;
INSERT INTO `rule_symptom` VALUES (1,1),(5,1),(2,2),(2,3),(4,4),(3,5),(5,6),(6,7),(7,8),(8,9);
/*!40000 ALTER TABLE `rule_symptom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `symptom`
--

LOCK TABLES `symptom` WRITE;
/*!40000 ALTER TABLE `symptom` DISABLE KEYS */;
INSERT INTO `symptom` VALUES (1,'Weak suction','The vacuum is not picking up dust properly','Low'),(2,'Smoke','Smoke is coming from the device','High'),(3,'Burning smell','A burning smell is detected','High'),(4,'No power','The device does not turn on','Medium'),(5,'Water leak','Water is leaking from the fixture','Medium'),(6,'Strange noise','The device makes unusual sounds during operation','Medium'),(7,'Overheating','The device becomes abnormally hot during use','High'),(8,'Clogging','The sink drains slowly or is blocked','Medium'),(9,'Dripping','Water continues dripping after the faucet is turned off','Low');
/*!40000 ALTER TABLE `symptom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Micheal','micheal@example.com','$2b$10$09bnzTaIxvqgQ7HUVMQpBOljZs9cUA0XK9MTBxaPiLVar33WU6Oty','2026-03-25 18:14:13');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed 

-- =============================================================
-- Demo Scenario Seeds
-- Scenario 1 (Low-Risk)      : Vacuum Cleaner + Weak Suction        -> covered by existing Rule 1
-- Scenario 2 (Emergency Stop): Heater + Smoke + Burning Smell       -> covered by existing Rule 2
-- Scenario 3 (Expert Consult): Sink + Water Leak + Strange Noise    -> Rule 9 (new)
-- Scenario 4 (Replacement)   : Air Purifier + No Power              -> Rule 10 (new)
-- =============================================================

--
-- Demo Scenario 3: New expert available for plumbing/fixture consultation
--

LOCK TABLES `expert` WRITE;
/*!40000 ALTER TABLE `expert` DISABLE KEYS */;
INSERT INTO `expert` VALUES (3,'Jordan Tan','Plumbing & Fixture Support','555-012-3456','jordan@example.com',4.2,'Available','$2b$10$vSplsLvH1nFBK5QKM9uvQeOpOz7uXVIND0biI/tr3WhAeeVIX7c3S');
/*!40000 ALTER TABLE `expert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Demo Scenario 3 & 4: New decision rules
--

LOCK TABLES `decision_rule` WRITE;
/*!40000 ALTER TABLE `decision_rule` DISABLE KEYS */;
INSERT INTO `decision_rule` VALUES
  (9,  3, 'expert consultation', 'Water leakage combined with unusual sounds may indicate a damaged pipe fitting or internal valve failure. Do not attempt self-repair. Professional inspection is required.', 'Medium', 1, 1, 1),
  (10, 5, 'replace part',        'The air purifier has lost power completely. Check the power cable and wall socket first. If the issue persists, the device or its power unit may need to be replaced.', 'Medium', 2, 0, 1);
/*!40000 ALTER TABLE `decision_rule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Demo Scenario 3 & 4: Symptom mappings for new rules
--

LOCK TABLES `rule_symptom` WRITE;
/*!40000 ALTER TABLE `rule_symptom` DISABLE KEYS */;
INSERT INTO `rule_symptom` VALUES
  (9,  5),  -- Rule 9  (Sink expert consultation) -> Water leak
  (9,  6),  -- Rule 9  (Sink expert consultation) -> Strange noise
  (10, 4);  -- Rule 10 (Air Purifier replace part) -> No power
/*!40000 ALTER TABLE `rule_symptom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Demo Scenario 4: Replacement options for Air Purifier (Rule 10, Device 5)
--

LOCK TABLES `replacement_option` WRITE;
/*!40000 ALTER TABLE `replacement_option` DISABLE KEYS */;
INSERT INTO `replacement_option` VALUES
  (10, 10, 5, 'HEPA Air Purifier 360 Coverage',      'Air Purifier', 89.99,  'https://amazon.ca/air-purifier-hepa',        1),
  (11, 10, 5, 'Smart Air Purifier with WiFi Control', 'Air Purifier', 119.99, 'https://bestbuy.ca/smart-air-purifier',       2),
  (12, 10, 5, 'Compact Room Air Purifier',            'Air Purifier', 69.99,  'https://homedepot.ca/compact-air-purifier',   3);
/*!40000 ALTER TABLE `replacement_option` ENABLE KEYS */;
UNLOCK TABLES;
