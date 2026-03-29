INSERT INTO DECISION_RULE
(DeviceID, OutcomeType, GuidanceText, RiskLevel, Priority, RequiresExpert, IsActive)
VALUES
(1, 'expert consultation', 'The vacuum cleaner may have internal blockage or motor issues. Please request expert support.', 'Medium', 2, 1, 1),
(1, 'stop and inspect', 'Stop using the vacuum cleaner and allow it to cool down before further inspection.', 'High', 3, 0, 1),
(3, 'low-risk troubleshooting', 'Try cleaning the drain using a safe drain-cleaning method.', 'Low', 2, 0, 1),
(3, 'replace part', 'The faucet may require a replacement seal or cartridge.', 'Low', 3, 0, 1);