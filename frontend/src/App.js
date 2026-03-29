import React, { useEffect, useState } from 'react';
import {
    getDeviceCategories,
    getDevicesByCategory,
    suggestSymptoms,
    createReport,
    diagnoseReport,
    createConsultation,
    getReplacementOptions
} from './api';
import './App.css';

function App() {
    const [userId, setUserId] = useState(1);

    const [categories, setCategories] = useState([]);
    const [devices, setDevices] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDevice, setSelectedDevice] = useState('');
    const [problemDescription, setProblemDescription] = useState('');

    const [suggestedSymptoms, setSuggestedSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);

    const [mediaFiles, setMediaFiles] = useState([]);

    const [reportId, setReportId] = useState(null);
    const [diagnosis, setDiagnosis] = useState(null);
    const [consultation, setConsultation] = useState(null);
    const [replacementOptions, setReplacementOptions] = useState([]);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [consultationLoading, setConsultationLoading] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await getDeviceCategories();
                setCategories(res.data || []);
            } catch (error) {
                setMessage(
                    error?.response?.data?.message ||
                    'Failed to load device categories.'
                );
            }
        };

        loadCategories();
    }, []);

    const resetAfterDeviceChange = () => {
        setSuggestedSymptoms([]);
        setSelectedSymptoms([]);
        setDiagnosis(null);
        setConsultation(null);
        setReplacementOptions([]);
        setReportId(null);
    };

    const handleCategoryChange = async (e) => {
        const categoryId = e.target.value;

        setSelectedCategory(categoryId);
        setSelectedDevice('');
        setDevices([]);
        resetAfterDeviceChange();

        if (!categoryId) return;

        try {
            const res = await getDevicesByCategory(categoryId);
            setDevices(res.data || []);
            setMessage('');
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to load devices.'
            );
        }
    };

    const handleDeviceChange = (e) => {
        setSelectedDevice(e.target.value);
        resetAfterDeviceChange();
    };

    const toggleSymptom = (symptomId) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptomId)
                ? prev.filter((id) => id !== symptomId)
                : [...prev, symptomId]
        );
    };

    const handleSuggestSymptoms = async () => {
        if (!selectedDevice) {
            setMessage('Please select a device first.');
            return;
        }

        if (!problemDescription.trim()) {
            setMessage('Please enter a problem description first.');
            return;
        }

        setSuggesting(true);
        setMessage('');

        try {
            const res = await suggestSymptoms({
                deviceId: Number(selectedDevice),
                problemDescription
            });

            const symptoms = res.data?.symptoms || [];
            setSuggestedSymptoms(symptoms);

            const autoSelected = symptoms
                .filter((symptom) => Number(symptom.score || 0) > 0)
                .map((symptom) => symptom.SymptomID);

            setSelectedSymptoms(autoSelected);

            if (symptoms.length === 0) {
                setMessage('No suggested symptoms found for this description.');
            } else {
                setMessage('Symptoms suggested successfully.');
            }
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to suggest symptoms.'
            );
        } finally {
            setSuggesting(false);
        }
    };

    const handleSubmitAndDiagnose = async () => {
        if (!selectedDevice) {
            setMessage('Please select a device.');
            return;
        }

        if (!problemDescription.trim()) {
            setMessage('Please enter a problem description.');
            return;
        }

        if (selectedSymptoms.length === 0) {
            setMessage('Please select at least one symptom.');
            return;
        }

        setLoading(true);
        setMessage('');
        setDiagnosis(null);
        setConsultation(null);
        setReplacementOptions([]);
        setReportId(null);

        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('deviceId', selectedDevice);
            formData.append('problemDescription', problemDescription);
            formData.append('symptomIds', JSON.stringify(selectedSymptoms));

            mediaFiles.forEach((file) => {
                formData.append('media', file);
            });

            const reportRes = await createReport(formData);
            const newReportId = reportRes.data.reportId;
            setReportId(newReportId);

            const diagnoseRes = await diagnoseReport(newReportId);
            const diagnosisData = diagnoseRes.data;
            setDiagnosis(diagnosisData);

            setMessage('Problem submitted and diagnosed successfully.');
        } catch (error) {
            setMessage(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Failed to submit and diagnose report.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleConsultation = async () => {
        if (!diagnosis?.resultId || consultationLoading) {
            return;
        }

        try {
            setConsultationLoading(true);

            const res = await createConsultation({
                resultId: diagnosis.resultId,
                userId: Number(userId),
                requestType: 'video',
                consultationNotes: 'Need expert help for this issue.'
            });

            setConsultation(res.data);
            setMessage(
                res.data.reused
                    ? 'Existing consultation loaded.'
                    : 'Consultation created successfully.'
            );
        } catch (error) {
            setMessage(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Failed to create consultation.'
            );
        } finally {
            setConsultationLoading(false);
        }
    };

    const handleReplacement = async () => {
        if (!diagnosis?.resultId) {
            setMessage('No diagnosis result found.');
            return;
        }

        try {
            const res = await getReplacementOptions(diagnosis.resultId);
            setReplacementOptions(res.data?.options || []);
            setMessage('Replacement options retrieved successfully.');
        } catch (error) {
            setMessage(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Failed to retrieve replacement options.'
            );
        }
    };

    const getRiskClass = (riskLevel) => {
        const risk = (riskLevel || '').toLowerCase();

        if (risk.includes('high')) return 'risk-high';
        if (risk.includes('medium')) return 'risk-medium';
        if (risk.includes('low')) return 'risk-low';
        return 'risk-neutral';
    };

    const openMeetingLink = (link) => {
        if (!link) {
            setMessage('Meeting link is unavailable.');
            return;
        }

        window.open(link, '_blank', 'noopener,noreferrer');
    };


    return (
        <div className="app-shell">
            <div className="container">
                <header className="hero">
                    <h1>FixPath</h1>
                    <p className="subtitle">
                        Decision-support troubleshooting platform
                    </p >
                </header>

                <section className="card">
                    <h2>Submit Problem Report</h2>

                    <div className="form-grid">
                        <div className="field">
                            <label>User ID</label>
                            <input
                                type="number"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label>Device Category</label>
                            <select
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat.CategoryID} value={cat.CategoryID}>
                                        {cat.CategoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Device</label>
                            <select
                                value={selectedDevice}
                                onChange={handleDeviceChange}
                                disabled={!selectedCategory}
                            >
                                <option value="">Select a device</option>
                                {devices.map((device) => (
                                    <option key={device.DeviceID} value={device.DeviceID}>
                                        {device.DeviceName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field field-full">
                            <label>Problem Description</label>
                            <textarea
                                value={problemDescription}
                                onChange={(e) => setProblemDescription(e.target.value)}
                                placeholder="Describe the issue..."
                            />
                        </div>

                        <div className="field field-full">
                            <div className="inline-row">
                                <label className="inline-label">Suggested Symptoms</label>
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={handleSuggestSymptoms}
                                    disabled={suggesting}
                                >
                                    {suggesting ? 'Suggesting...' : 'Suggest Symptoms'}
                                </button>
                            </div>

                            {suggestedSymptoms.length === 0 ? (
                                <div className="helper-box">
                                    No symptoms suggested yet. Select a device and enter a
                                    problem description first.
                                </div>
                            ) : (
                                <div className="checkbox-group">
                                    {suggestedSymptoms.map((symptom) => (
                                        <label key={symptom.SymptomID} className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedSymptoms.includes(symptom.SymptomID)}
                                                onChange={() => toggleSymptom(symptom.SymptomID)}
                                            />
                                            <span className="checkbox-text">
                                                <strong>{symptom.SymptomName}</strong>
                                                {symptom.score !== undefined && (
                                                    <span className="score-badge">
                                                        score: {Number(symptom.score).toFixed(1)}
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="field field-full">
                            <label>Upload Photos or Video</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                            />
                            {mediaFiles.length > 0 && (
                                <ul className="file-list">
                                    {mediaFiles.map((file, index) => (
                                        <li key={`${file.name}-${index}`}>
                                            {file.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="button-row">
                        <button
                            type="button"
                            className="primary-btn"
                            onClick={handleSubmitAndDiagnose}
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit and Diagnose'}
                        </button>
                    </div>
                </section>

                {message && (
                    <section className="card">
                        <h2>System Message</h2>
                        <p>{message}</p >
                    </section>
                )}

                {reportId && (
                    <section className="card">
                        <h2>Report Created</h2>
                        <p>
                            <strong>Report ID:</strong> {reportId}
                        </p >
                    </section>
                )}

                {diagnosis && (
                    <section className="card">
                        <h2>Diagnosis Result</h2>

                        <div className="result-grid">
                            <div className="result-box">
                                <span className="label">Outcome</span>
                                <span className="value">{diagnosis.outcome}</span>
                            </div>

                            <div className={`result-box ${getRiskClass(diagnosis.riskLevel)}`}>
                                <span className="label">Risk Level</span>
                                <span className="value">{diagnosis.riskLevel}</span>
                            </div>

                            <div className="result-box">
                                <span className="label">Result ID</span>
                                <span className="value">{diagnosis.resultId}</span>
                            </div>
                        </div>

                        <div className="recommendation-box">
                            <span className="label">Recommendation</span>
                            <p>{diagnosis.recommendation}</p >
                        </div>

                        <div className="button-row">
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={handleConsultation}
                                disabled={consultationLoading}
                            >
                                {consultationLoading ? 'Processing...' : 'Request Expert Consultation'}
                            </button>                            

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={handleReplacement}
                            >
                                View Replacement Options
                            </button>
                        </div>
                    </section>
                )}

                {consultation && (
                    <section className="card">
                        <h2>Consultation</h2>

                        <div className="result-grid">
                            <div className="result-box">
                                <span className="label">Consultation ID</span>
                                <span className="value">{consultation.consultationId}</span>
                            </div>

                            <div className="result-box">
                                <span className="label">Mode</span>
                                <span className="value">{consultation.consultationMode}</span>
                            </div>
                        </div>

                        <div className="recommendation-box">
                            <p>
                                <strong>Expert:</strong> {consultation.expert?.expertName}
                            </p >
                            <p>
                                <strong>Service Type:</strong> {consultation.expert?.serviceType}
                            </p >
                            <p>
                                <strong>Email:</strong> {consultation.expert?.expertEmail}
                            </p >
                            <p>
                                <strong>Rating:</strong> {consultation.expert?.expertRating}
                            </p >
                            <div>
                                <p>
                                    <strong>Meeting Link:</strong> {consultation.meetingLink}
                                </p >
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => openMeetingLink(consultation.meetingLink)}
                                >
                                    Join Video Consultation
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {replacementOptions.length > 0 && (
                    <section className="card">
                        <h2>Replacement Options</h2>

                        <div className="replacement-list">
                            {replacementOptions.map((item) => (
                                <div key={item.OptionID} className="replacement-card">
                                    <h3>{item.ProductName}</h3>
                                    <p>
                                        <strong>Type:</strong> {item.ProductType}
                                    </p >
                                    <p>
                                        <strong>Price:</strong> ${item.EstimatedPrice}
                                    </p >
                                    <p>
                                        <strong>Merchant:</strong> {item.MerchantName}
                                    </p >
                                    <a
                                        href={item.ProductURL}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Visit Merchant
                                    </ a>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default App;