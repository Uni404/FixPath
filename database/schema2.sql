USE fixpath_db;

CREATE TABLE EXPERT (
    ExpertID INT AUTO_INCREMENT PRIMARY KEY,
    ExpertName VARCHAR(100) NOT NULL,
    ServiceType VARCHAR(100),
    Phone VARCHAR(50),
    ExpertEmail VARCHAR(150),
    ExpertPasswordHarsh VARCHAR(255),
    ExpertRating DECIMAL(2,1),
    AvailabilityStatus VARCHAR(50) NOT NULL
);

CREATE TABLE CONSULTATION (
    ConsultationID INT AUTO_INCREMENT PRIMARY KEY,
    ResultID INT NOT NULL,
    UserID INT NOT NULL,
    ExpertID INT NOT NULL,
    RequestType VARCHAR(50),
    ConsultationStatus VARCHAR(50) NOT NULL,
    RequestDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ConsultationDate DATETIME NULL,
    ConsultationNotes TEXT,
    MeetingLink VARCHAR(255),
    FOREIGN KEY (ResultID) REFERENCES DECISION_RESULT(ResultID),
    FOREIGN KEY (UserID) REFERENCES USER(UserID),
    FOREIGN KEY (ExpertID) REFERENCES EXPERT(ExpertID)
);