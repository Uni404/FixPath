USE fixpath_db;

-- USER
INSERT INTO USER (Name, Email, PasswordHash)
VALUES
('Danny', 'danny@example.com', 'hashed_password_123');

-- DEVICE_CATEGORY
INSERT INTO DEVICE_CATEGORY (CategoryName, CategoryDescription)
VALUES
('Vacuum Cleaner', 'Home cleaning devices'),
('Heater', 'Household heating devices'),
('Sink', 'Bathroom or kitchen sink fixtures');

-- DEVICE
INSERT INTO DEVICE (CategoryID, DeviceName, Manufacturer, Model, DeviceDescription)
VALUES
(1, 'Vacuum Cleaner', 'Dyson', 'V8', 'Cordless vacuum cleaner'),
(2, 'Heater', 'Honeywell', 'H100', 'Portable electric heater'),
(3, 'Sink', 'Delta', 'S200', 'Standard household sink');

-- SYMPTOM
INSERT INTO SYMPTOM (SymptomName, SymptomDescription, SeverityLevel)
VALUES
('Weak suction', 'The vacuum is not picking up dust properly', 'Low'),
('Smoke', 'Smoke is coming from the device', 'High'),
('Burning smell', 'A burning smell is detected', 'High'),
('No power', 'The device does not turn on', 'Medium'),
('Water leak', 'Water is leaking from the fixture', 'Medium');

-- DECISION_RULE
INSERT INTO DECISION_RULE (DeviceID, OutcomeType, GuidanceText, RiskLevel, Priority, RequiresExpert, IsActive)
VALUES
(1, 'low-risk troubleshooting', 'Clean the filter and check for blockages.', 'Low', 1, FALSE, TRUE),
(2, 'emergency stop', 'Stop using the heater immediately and contact a professional.', 'High', 1, TRUE, TRUE),
(3, 'expert consultation', 'Request professional help to inspect the leak.', 'Medium', 1, TRUE, TRUE),
(2, 'expert consultation', 'Check the power cable first. If the issue remains, contact an expert.', 'Medium', 2, TRUE, TRUE);

-- RULE_SYMPTOM
-- Rule 1: Vacuum Cleaner + Weak suction -> low-risk troubleshooting
INSERT INTO RULE_SYMPTOM (RuleID, SymptomID)
VALUES
(1, 1);

-- Rule 2: Heater + Smoke -> emergency stop
INSERT INTO RULE_SYMPTOM (RuleID, SymptomID)
VALUES
(2, 2),
(2, 3);

-- Rule 3: Sink + Water leak -> expert consultation
INSERT INTO RULE_SYMPTOM (RuleID, SymptomID)
VALUES
(3, 5);

-- Rule 4: Heater + No power -> expert consultation
INSERT INTO RULE_SYMPTOM (RuleID, SymptomID)
VALUES
(4, 4);