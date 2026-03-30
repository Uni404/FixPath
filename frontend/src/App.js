import React, { useEffect, useState, useCallback } from 'react';
import {
    getDeviceCategories,
    getDevicesByCategory,
    suggestSymptoms,
    createReport,
    diagnoseReport,
    createConsultation,
    getReplacementOptions,
    updateConsultationStatus,
    getConsultationById,
    userLogin,
    expertLogin,
    getExpertConsultations,
    getExpertProfileById,
    updateExpertProfile,
    getUserProfileById,
    updateUserProfile,
    getUserReports,
    getUserResults,
    getUserConsultations
} from './api';
import './App.css';

function App() {

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

    const [role, setRole] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loginType, setLoginType] = useState(null);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });

    const [consultations, setConsultations] = useState([]);

    const [selectedConsultation, setSelectedConsultation] = useState(null);

    const [isEditingExpertProfile, setIsEditingExpertProfile] = useState(false);
    const [expertProfileForm, setExpertProfileForm] = useState({
        expertName: '',
        phone: '',
        serviceType: '',
        availabilityStatus: ''
    });
    const [expertView, setExpertView] = useState('dashboard');
    const [expertConsultationSearch, setExpertConsultationSearch] = useState('');

    const [isEditingUserProfile, setIsEditingUserProfile] = useState(false);
    const [userProfileForm, setUserProfileForm] = useState({
        name: ''
    });
    const [userReports, setUserReports] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [userConsultationHistory, setUserConsultationHistory] = useState([]);
    const [userView, setUserView] = useState('dashboard');
    const [reportSearch, setReportSearch] = useState('');
    const [resultSearch, setResultSearch] = useState('');
    const [consultationSearch, setConsultationSearch] = useState('');

   

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

    useEffect(() => {
        if (!consultation?.consultationId) return;

        const timer = setInterval(async () => {
            try {
                const res = await getConsultationById(consultation.consultationId);

                setConsultation({
                    consultationId: res.data.consultation.ConsultationID,
                    consultationMode: res.data.consultation.RequestType,
                    consultationStatus: res.data.consultation.ConsultationStatus,
                    meetingLink: res.data.consultation.MeetingLink,
                    expert: {
                        expertId: res.data.consultation.ExpertID,
                        expertName: res.data.consultation.ExpertName,
                        expertEmail: res.data.consultation.ExpertEmail,
                        expertRating: res.data.consultation.ExpertRating,
                        serviceType: res.data.consultation.ServiceType
                    }
                });
            } catch (error) {
                console.error(error);
            }
        }, 4000);

        return () => clearInterval(timer);
    }, [consultation?.consultationId]);



    const resetAfterDeviceChange = () => {
        setSuggestedSymptoms([]);
        setSelectedSymptoms([]);
        setDiagnosis(null);
        setConsultation(null);
        setReplacementOptions([]);
        setReportId(null);
    };


    const fetchUserHistory = useCallback(async (userIdParam) => {
        const currentUserId = userIdParam || profile?.id;
        if (!currentUserId) return;

        try {
            const [reportsRes, resultsRes, consultationsRes] = await Promise.all([
                getUserReports(currentUserId),
                getUserResults(currentUserId),
                getUserConsultations(currentUserId)
            ]);

            setUserReports(reportsRes.data.reports || []);
            setUserResults(resultsRes.data.results || []);
            setUserConsultationHistory(consultationsRes.data.consultations || []);
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to load user history.'
            );
        }
    }, [profile?.id]);

    useEffect(() => {
        if (role === 'user' && profile?.id) {
            fetchUserHistory(profile.id);
        }
    }, [role, profile?.id, fetchUserHistory]);


    const handleLoginChange = (e) => {
        setLoginForm({
            ...loginForm,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async () => {
        if (!loginType) {
            setMessage('Please choose a login type.');
            return;
        }

        if (!loginForm.email || !loginForm.password) {
            setMessage('Please enter email and password.');
            return;
        }

        try {
            const res =
                loginType === 'user'
                    ? await userLogin(loginForm)
                    : await expertLogin(loginForm);

            setRole(res.data.role);
            setProfile(res.data.profile);
            setMessage(res.data.message || 'Login successful.');

            if (res.data.role === 'user') {
                setUserView('dashboard');
                setTimeout(() => {
                    fetchUserHistory(res.data.profile?.id);
                }, 0);
            }

            if (res.data.role === 'expert') {
                setExpertView('dashboard');
            }

            setLoginForm({
                email: '',
                password: ''
            });
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Login failed.'
            );
        }
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
            formData.append('userId', profile.id);
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
            await fetchUserHistory(profile?.id);
           

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
                userId: Number(profile.id),
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

    const fetchConsultations = async () => {
        if (!profile?.id) {
            setMessage('Expert profile is missing.');
            return;
        }

        try {
            const res = await getExpertConsultations(profile.id);
            setConsultations(res.data || []);
            setMessage('');
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to fetch consultations.'
            );
        }
    };

    const fetchConsultationDetail = async (id) => {
        try {
            const res = await getConsultationById(id);
            console.log('DETAIL RSPONSE:', res.data);
            setSelectedConsultation(res.data.consultation);
            setMessage('');
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to fetch consultation detail.'
            );
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await updateConsultationStatus(id, status);
            fetchConsultations();
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to update consultation status.'
            );
        }
    };


    const confirmAndOpenMeeting = async (consultationItem) => {
        try {
            await updateConsultationStatus(consultationItem.ConsultationID, 'ready');

            
            await fetchConsultations();

            
            if (
                selectedConsultation &&
                selectedConsultation.ConsultationID === consultationItem.ConsultationID
            ) {
                await fetchConsultationDetail(consultationItem.ConsultationID);
            }

            
            if (consultationItem.MeetingLink) {
                openMeetingLink(consultationItem.MeetingLink);
            } else {
                setMessage('Meeting link is missing.');
            }

        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to confirm consultation.'
            );
        }
    };

    const startEditExpertProfile = async () => {
        if (!profile?.id) return;

        try {
            const res = await getExpertProfileById(profile.id);
            const p = res.data.profile;

            setExpertProfileForm({
                expertName: p.ExpertName || '',
                phone: p.Phone || '',
                serviceType: p.ServiceType || '',
                availabilityStatus: p.AvailabilityStatus || ''
            });

            setIsEditingExpertProfile(true);
            setMessage('');
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to load expert profile.'
            );
        }
    };

    const handleExpertProfileChange = (e) => {
        setExpertProfileForm({
            ...expertProfileForm,
            [e.target.name]: e.target.value
        });
    };

    const saveExpertProfile = async () => {
        if (!profile?.id) return;

        try {
            const res = await updateExpertProfile(profile.id, {
                    expertName: expertProfileForm.expertName,
                    phone: expertProfileForm.phone,
                    serviceType: expertProfileForm.serviceType,
                    availabilityStatus: expertProfileForm.availabilityStatus
             });
            
            const updated = res.data.profile;

            setProfile({
                id: updated.ExpertID,
                name: updated.ExpertName,
                email: updated.ExpertEmail,
                phone: updated.Phone,
                serviceType: updated.ServiceType,
                rating: updated.ExpertRating,
                availabilityStatus: updated.AvailabilityStatus
            });

            setIsEditingExpertProfile(false);
            setMessage('Expert profile updated successfully.');
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to update expert profile.'
            );
        }
    };

    const startEditUserProfile = async () => {
        if (!profile?.id) return;

        try {
            const res = await getUserProfileById(profile.id);
            const p = res.data.profile;

            setUserProfileForm({
                name: p.Name || ''
            });

            setIsEditingUserProfile(true);
            setMessage('');
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to load user profile.'
            );
        }
    };

    const handleUserProfileChange = (e) => {
        setUserProfileForm({
            ...userProfileForm,
            [e.target.name]: e.target.value
        });
    };

    const saveUserProfile = async () => {
        if (!profile?.id) return;

        try {
            const res = await updateUserProfile(profile.id, {
                name: userProfileForm.name
            });
            const updated = res.data.profile;

            setProfile({
                id: updated.UserID,
                name: updated.Name,
                email: updated.Email,
            });

            setIsEditingUserProfile(false);
            setMessage('User profile updated successfully.');
        } catch (error) {
            setMessage(
                error?.response?.data?.message || 'Failed to update user profile.'
            );
        }
    };





    if (!role) {
        return (
            <div className="app-shell">
                <div className="container">
                    <div className="card">
                        <h1>FixPath</h1>
                        <p className="subtitle">Decision-support troubleshooting platform</p >

                        <div className="button-row">
                            <button
                                type="button"
                                className={loginType === 'user' ? 'primary-btn' : 'secondary-btn'}
                                onClick={() => setLoginType('user')}
                            >
                                User Login
                            </button>

                            <button
                                type="button"
                                className={loginType === 'expert' ? 'primary-btn' : 'secondary-btn'}
                                onClick={() => setLoginType('expert')}
                            >
                                Expert Login
                            </button>
                        </div>

                        <div className="field" style={{ marginTop: '16px' }}>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={loginForm.email}
                                onChange={handleLoginChange}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="field">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={loginForm.password}
                                onChange={handleLoginChange}
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="button-row">
                            <button
                                type="button"
                                className="primary-btn"
                                onClick={handleLogin}
                            >
                                Login
                            </button>
                        </div>

                        {message && (
                            <div className="helper-box" style={{ marginTop: '12px' }}>
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    if (role === 'expert') {
        return (
            <div className="container">
                <h1>Expert Dashboard</h1>

                {expertView === 'dashboard' && (
                    <>

                        {profile && (
                            <div className="card">
                                <h2>Expert Profile</h2>
                                {!isEditingExpertProfile ? (
                                    <>
                                        <p><strong>Name:</strong> {profile.name}</p >
                                        <p><strong>Email:</strong> {profile.email}</p >
                                        <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p >
                                        <p><strong>Service Type:</strong> {profile.serviceType}</p >
                                        <p><strong>Rating:</strong> {profile.rating}</p >
                                        <p><strong>Status:</strong> {profile.availabilityStatus || 'Unknown'}</p >

                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={startEditExpertProfile}
                                        >
                                            Edit Profile
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="field">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                name="expertName"
                                                value={expertProfileForm.expertName}
                                                onChange={handleExpertProfileChange}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                name="expertEmail"
                                                value={expertProfileForm.expertEmail}
                                                onChange={handleExpertProfileChange}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Phone</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={expertProfileForm.phone}
                                                onChange={handleExpertProfileChange}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Service Type</label>
                                            <input
                                                type="text"
                                                name="serviceType"
                                                value={expertProfileForm.serviceType}
                                                onChange={handleExpertProfileChange}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Availability Status</label>
                                            <select
                                                name="availabilityStatus"
                                                value={expertProfileForm.availabilityStatus}
                                                onChange={handleExpertProfileChange}
                                            >
                                                <option value="Available">Available</option>
                                                <option value="Busy">Busy</option>
                                                <option value="Offline">Offline</option>
                                            </select>
                                        </div>

                                        <div className="button-row">
                                            <button
                                                type="button"
                                                className="primary-btn"
                                                onClick={saveExpertProfile}
                                            >
                                                Save
                                            </button>

                                            <button
                                                type="button"
                                                className="secondary-btn"
                                                onClick={() => setIsEditingExpertProfile(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                    </>
                                )}
                            </div>
                        )}

                        <button onClick={fetchConsultations}>Refresh</button>
                        <button
                            onClick={() => {
                                setRole(null);
                                setProfile(null);
                                setLoginType(null);
                                // setSelectedConsultation(null);
                                // setConsultations([]);
                            }}

                        >
                            Logout
                        </button>

                        <div className="card">
                            <h2>Current Consultation</h2>

                            {consultations.length === 0 ? (
                                <p>No consultations assigned.</p >
                            ) : (
                                <div className="consultation-item">
                                    <p><strong>Consultation ID:</strong> {consultations[0].ConsultationID}</p >
                                    <p><strong>Result ID:</strong> {consultations[0].ResultID}</p >
                                    <p><strong>Status:</strong> {consultations[0].ConsultationStatus}</p >
                                    <p><strong>Request Date:</strong> {consultations[0].RequestDate}</p >

                                    <div className="button-row">

                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={() =>
                                                fetchConsultationDetail(consultations[0].ConsultationID)
                                            }
                                        >
                                            View Detail
                                        </button>

                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={() => confirmAndOpenMeeting(consultations[0])}
                                            disabled={
                                                consultations[0].ConsultationStatus === 'ready' ||
                                                consultations[0].ConsultationStatus === 'ongoing' ||
                                                consultations[0].ConsultationStatus === 'completed'
                                            }
                                        >
                                            Confirm and Open Meeting
                                        </button>

                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={() =>
                                                updateStatus(consultations[0].ConsultationID, 'completed')
                                            }
                                            disabled={consultations[0].ConsultationStatus === 'completed'}
                                        >
                                            Complete
                                        </button>

                                    </div>

                                </div>
                            )}
                        </div>
                        <div className="card">
                            <h2>Consultation History</h2>
                            <p>View all assigned consultations and search consultation records.</p >

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setExpertView('consultations-history')}
                            >
                                View All Consultations
                            </button>
                        </div>



                        {selectedConsultation && (
                            <div className="card">
                                <h2>Consultation Detail</h2>

                                <p><strong>Consultation ID:</strong> {selectedConsultation.ConsultationID}</p >
                                <p><strong>Result ID:</strong> {selectedConsultation.ResultID}</p >
                                <p><strong>User ID:</strong> {selectedConsultation.UserID}</p >
                                <p><strong>Category:</strong> {selectedConsultation.CategoryName}</p >
                                <p><strong>Device:</strong> {selectedConsultation.DeviceName}</p >
                                <p><strong>Problem Report:</strong> {selectedConsultation.ProblemDescription}</p >
                                <p><strong>Report Date:</strong> {selectedConsultation.ReportDate}</p >

                                <p><strong>Diagnosis Outcome:</strong> {selectedConsultation.Outcome}</p >
                                <p><strong>Risk Level:</strong> {selectedConsultation.RiskLevel}</p >
                                <p><strong>Recommendation:</strong> {selectedConsultation.Recommendation}</p >

                                {selectedConsultation.media?.length > 0 && (
                                    <div className="card">
                                        <h3>Uploaded Media</h3>

                                        {selectedConsultation.media.map((item) => (
                                            <div key={item.MediaID} style={{ marginBottom: '16px' }}>
                                                {item.MediaType === 'image' ? (
                                                    <img
                                                        src={`http://localhost:5000${item.MediaURL}`}
                                                        alt="Uploaded issue"
                                                        style={{ width: '220px', borderRadius: '8px' }}
                                                    />
                                                ) : (
                                                    <video width="320" controls>
                                                        <source
                                                            src={`http://localhost:5000${item.MediaURL}`}
                                                            type="video/mp4"
                                                        />
                                                        Your browser does not support video playback.
                                                    </video>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p><strong>Report Date:</strong> {selectedConsultation.ReportDate}</p >
                                <p><strong>Expert:</strong> {selectedConsultation.ExpertName}</p >
                                <p><strong>Service Type:</strong> {selectedConsultation.ServiceType}</p >
                                <p><strong>Status:</strong> {selectedConsultation.ConsultationStatus}</p >
                                <p><strong>Request Type:</strong> {selectedConsultation.RequestType}</p >
                                <p><strong>Request Date:</strong> {selectedConsultation.RequestDate}</p >
                                <p><strong>Consultation Date:</strong> {selectedConsultation.ConsultationDate || 'Not started yet'}</p >
                                <p><strong>Notes:</strong> {selectedConsultation.ConsultationNotes || 'No notes'}</p >
                                <p><strong>Meeting Link:</strong> {selectedConsultation.MeetingLink}</p >
                                <p><strong>Meeting Role:</strong> Host (Expert)</p >

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => openMeetingLink(selectedConsultation.MeetingLink)}
                                >
                                    Join Video Consultation
                                </button>
                            </div>
                        )}
                    </>
                )}
                    
                {expertView === 'consultations-history' && (
                    <div className="card">
                        <h2>All Consultations</h2>

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => setExpertView('dashboard')}
                        >
                            Back to Dashboard
                        </button>

                        <div style={{ marginTop: '16px' }}>
                            <input
                                type="text"
                                placeholder="Search consultations..."
                                value={expertConsultationSearch}
                                onChange={(e) => setExpertConsultationSearch(e.target.value)}
                            />
                        </div>

                        <ul>
                            {consultations
                                .filter((c) =>
                                    String(c.ConsultationID).includes(expertConsultationSearch) ||
                                    (c.ConsultationStatus || '')
                                        .toLowerCase()
                                        .includes(expertConsultationSearch.toLowerCase()) ||
                                    (c.ServiceType || '')
                                        .toLowerCase()
                                        .includes(expertConsultationSearch.toLowerCase())
                                )
                                .map((c) => (
                                    <li key={c.ConsultationID} className="consultation-item">
                                        <div
                                            onClick={() => fetchConsultationDetail(c.ConsultationID)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div><strong>Consultation ID:</strong> {c.ConsultationID}</div>
                                            <div><strong>Result:</strong> {c.ResultID}</div>
                                            <div><strong>Status:</strong> {c.ConsultationStatus}</div>
                                        </div>

                                        <div className="button-row">
                                            <button
                                                type="button"
                                                className="secondary-btn"
                                                onClick={() => confirmAndOpenMeeting(c)}
                                                disabled={
                                                    c.ConsultationStatus === 'ready' ||
                                                    c.ConsultationStatus === 'ongoing' ||
                                                    c.ConsultationStatus === 'completed'
                                                }
                                            >
                                                Confirm and Open Meeting
                                            </button>

                                            <button
                                                type="button"
                                                className="secondary-btn"
                                                onClick={() => updateStatus(c.ConsultationID, 'completed')}
                                                disabled={c.ConsultationStatus === 'completed'}
                                            >
                                                Complete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}
               
            </div>  
            
        );
    }

    if (role === 'user') {
        return (
            <div className="app-shell">
                <div className="container">
                    <header className="hero">
                        <h1>FixPath User Dashboard</h1>
                        <p className="subtitle">Manage your reports, results, and consultations</p >
                    </header>

                    {userView === 'dashboard' && (
                        <>
                            {profile && role === 'user' && (
                                <section className="card">
                                    <h2>User Profile</h2>
                            
                                    {!isEditingUserProfile ? (
                                        <>
                                            <p><strong>Name:</strong> {profile.name}</p >
                                            <p><strong>Email:</strong> {profile.email}</p >

                                            <button
                                                type="button"
                                                className="secondary-btn"
                                                onClick={startEditUserProfile}
                                            >
                                                Edit Profile
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="field">
                                                <label>Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={userProfileForm.name}
                                                    onChange={handleUserProfileChange}
                                                />
                                            </div>

                                            <div className="field">
                                                <label>Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={userProfileForm.email}
                                                    onChange={handleUserProfileChange}
                                                />
                                            </div>

                                            <div className="button-row">
                                                <button
                                                    type="button"
                                                    className="primary-btn"
                                                    onClick={saveUserProfile}
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    className="secondary-btn"
                                                    onClick={() => setIsEditingUserProfile(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </section>
                            )}
                           
                            <div className="button-row">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => {
                                        setRole(null);
                                        setProfile(null);
                                        setLoginType(null);
                                        setUserView('dashboard'); 
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                            <section className="card">
                                <h2>Quick Action</h2>
                                <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={() => setUserView('report-form')}
                                >
                                    + Create New Report
                                </button>
                            </section>

                            <section className="card">
                                <h2>Latest Reports</h2>

                                {userReports.length === 0 ? (
                                    <p>No reports found.</p >
                                ) : (
                                    userReports.slice(0, 1).map((report) => (
                                        <div key={report.ReportID} className="consultation-item">
                                            <p><strong>Report ID:</strong> {report.ReportID}</p >
                                            <p><strong>Category:</strong> {report.CategoryName}</p >
                                            <p><strong>Device:</strong> {report.DeviceName}</p >
                                            <p><strong>Problem:</strong> {report.ProblemDescription}</p >
                                            <p><strong>Date:</strong> {report.ReportDate}</p >
                                            <p><strong>Status:</strong> {report.Status}</p >
                                        </div>
                                    ))
                                )}

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setUserView('reports-history')}
                                >
                                    View More
                                </button>
                            </section>

                            <section className="card">
                                <h2>Latest Results</h2>

                                {userResults.length === 0 ? (
                                    <p>No results found.</p >
                                ) : (
                                    userResults.slice(0, 1).map((result) => (
                                        <div key={result.ResultID} className="consultation-item">
                                            <p><strong>Result ID:</strong> {result.ResultID}</p >
                                            <p><strong>Report ID:</strong> {result.ReportID}</p >
                                            <p><strong>Outcome:</strong> {result.Outcome}</p >
                                            <p><strong>Risk Level:</strong> {result.RiskLevel}</p >
                                            <p><strong>Recommendation:</strong> {result.Recommendation}</p >
                                            <p><strong>Date:</strong> {result.ResultDate}</p >
                                        </div>
                                    ))
                                )}

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setUserView('results-history')}
                                >
                                    View More
                                </button>
                            </section>

                            <section className="card">
                                <h2>Latest Consultations</h2>

                                {userConsultationHistory.length === 0 ? (
                                    <p>No consultations found.</p >
                                ) : (
                                    userConsultationHistory.slice(0, 1).map((item) => (
                                        <div key={item.ConsultationID} className="consultation-item">
                                            <p><strong>Consultation ID:</strong> {item.ConsultationID}</p >
                                            <p><strong>Result ID:</strong> {item.ResultID}</p >
                                            <p><strong>Expert:</strong> {item.ExpertName}</p >
                                            <p><strong>Service Type:</strong> {item.ServiceType}</p >
                                            <p><strong>Status:</strong> {item.ConsultationStatus}</p >
                                            <p><strong>Date:</strong> {item.RequestDate}</p >
                                        </div>
                                    ))
                                )}

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setUserView('consultations-history')}
                                >
                                    View More
                                </button>
                            </section>
                        </>
                    )}

                    {userView === 'report-form' && (
                        <>
                            <section className="card">
                                <h2>Submit Problem Report</h2>

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setUserView('dashboard')}
                                >
                                    Back to Dashboard
                                </button>

                                <div className="form-grid" style={{ marginTop: '16px' }}>
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
                                    <p><strong>Report ID:</strong> {reportId}</p >
                                </section>
                            )}

                            {diagnosis && (
                                <section className="card">
                                    <h2>Diagnosis Result</h2>
                                    <p><strong>Result ID:</strong> {diagnosis.resultId}</p >
                                    <p><strong>Outcome:</strong> {diagnosis.outcome}</p >
                                    <p><strong>Risk Level:</strong> {diagnosis.riskLevel}</p >
                                    <p><strong>Recommendation:</strong> {diagnosis.recommendation}</p >

                                    <div className="button-row">
                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={handleConsultation}
                                        >
                                            Request Expert Consultation
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

                                        <div className="result-box">
                                            <span className="label">Status</span>
                                            <span className="value">{consultation.consultationStatus}</span>
                                        </div>
                                    </div>

                                    <div className="recommendation-box">
                                        <p><strong>Expert:</strong> {consultation.expert?.expertName}</p >
                                        <p><strong>Service Type:</strong> {consultation.expert?.serviceType}</p >
                                        <p><strong>Email:</strong> {consultation.expert?.expertEmail}</p >
                                        <p><strong>Rating:</strong> {consultation.expert?.expertRating}</p >

                                        {consultation.consultationStatus === 'pending' && (
                                            <p style={{ color: '#888' }}>
                                                Waiting for expert confirmation...
                                            </p >
                                        )}

                                        {(consultation.consultationStatus === 'ready' ||
                                            consultation.consultationStatus === 'ongoing') && (
                                                <>
                                                    <p style={{ color: 'green' }}>
                                                        Your expert is ready. You may now join the meeting.
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
                                                </>
                                            )}

                                        {consultation.consultationStatus === 'completed' && (
                                            <p style={{ color: '#555' }}>
                                                Consultation completed.
                                            </p >
                                        )}
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
                                                <p><strong>Type:</strong> {item.ProductType}</p >
                                                <p><strong>Price:</strong> ${item.EstimatedPrice}</p >
                                                <p><strong>Merchant:</strong> {item.MerchantName}</p >
                                                <a
                                                    href={
                                                        item.ProductURL?.startsWith('https://')
                                                            ? item.ProductURL
                                                            : `https//${item.ProductURL}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Product
                                                </ a>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {userView === 'reports-history' && (
                        <section className="card">
                            <h2>All Reports</h2>

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setUserView('dashboard')}
                            >
                                Back to Dashboard
                            </button>

                            <div style={{ marginTop: '16px' }}>
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={reportSearch}
                                    onChange={(e) => setReportSearch(e.target.value)}
                                />
                            </div>

                            {userReports
                                .filter((report) =>
                                    String(report.ReportID).includes(reportSearch) ||
                                    (report.CategoryName || '').toLowerCase().includes(reportSearch.toLowerCase()) ||
                                    (report.DeviceName || '').toLowerCase().includes(reportSearch.toLowerCase()) ||
                                    (report.ProblemDescription || '').toLowerCase().includes(reportSearch.toLowerCase())
                                )
                                .map((report) => (
                                    <div key={report.ReportID} className="consultation-item">
                                        <p><strong>Report ID:</strong> {report.ReportID}</p >
                                        <p><strong>Category:</strong> {report.CategoryName}</p >
                                        <p><strong>Device:</strong> {report.DeviceName}</p >
                                        <p><strong>Problem:</strong> {report.ProblemDescription}</p >
                                        <p><strong>Date:</strong> {report.ReportDate}</p >
                                        <p><strong>Status:</strong> {report.Status}</p >
                                    </div>
                                ))}

                            {userReports.length === 0 && <p>No reports found.</p >}
                        </section>
                    )}

                    {userView === 'results-history' && (
                        <section className="card">
                            <h2>All Results</h2>

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setUserView('dashboard')}
                            >
                                Back to Dashboard
                            </button>

                            <div style={{ marginTop: '16px' }}>
                                <input
                                    type="text"
                                    placeholder="Search results..."
                                    value={resultSearch}
                                    onChange={(e) => setResultSearch(e.target.value)}
                                />
                            </div>

                            {userResults
                                .filter((result) =>
                                    String(result.ResultID).includes(resultSearch) ||
                                    (result.Outcome || '').toLowerCase().includes(resultSearch.toLowerCase()) ||
                                    (result.RiskLevel || '').toLowerCase().includes(resultSearch.toLowerCase()) ||
                                    (result.Recommendation || '').toLowerCase().includes(resultSearch.toLowerCase())
                                )
                                .map((result) => (
                                    <div key={result.ResultID} className="consultation-item">
                                        <p><strong>Result ID:</strong> {result.ResultID}</p >
                                        <p><strong>Report ID:</strong> {result.ReportID}</p >
                                        <p><strong>Outcome:</strong> {result.Outcome}</p >
                                        <p><strong>Risk Level:</strong> {result.RiskLevel}</p >
                                        <p><strong>Recommendation:</strong> {result.Recommendation}</p >
                                        <p><strong>Date:</strong> {result.ResultDate}</p >
                                    </div>
                                ))}

                            {userResults.length === 0 && <p>No diagnosis results found.</p >}
                        </section>
                    )}

                    {userView === 'consultations-history' && (
                        <section className="card">
                            <h2>All Consultations</h2>

                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setUserView('dashboard')}
                            >
                                Back to Dashboard
                            </button>

                            <div style={{ marginTop: '16px' }}>
                                <input
                                    type="text"
                                    placeholder="Search consultations..."
                                    value={consultationSearch}
                                    onChange={(e) => setConsultationSearch(e.target.value)}
                                />
                            </div>

                            {userConsultationHistory
                                .filter((item) =>
                                    String(item.ConsultationID).includes(consultationSearch) ||
                                    (item.ExpertName || '').toLowerCase().includes(consultationSearch.toLowerCase()) ||
                                    (item.ServiceType || '').toLowerCase().includes(consultationSearch.toLowerCase()) ||
                                    (item.ConsultationStatus || '').toLowerCase().includes(consultationSearch.toLowerCase())
                                )
                                .map((item) => (
                                    <div key={item.ConsultationID} className="consultation-item">
                                        <p><strong>Consultation ID:</strong> {item.ConsultationID}</p >
                                        <p><strong>Result ID:</strong> {item.ResultID}</p >
                                        <p><strong>Expert:</strong> {item.ExpertName}</p >
                                        <p><strong>Service Type:</strong> {item.ServiceType}</p >
                                        <p><strong>Status:</strong> {item.ConsultationStatus}</p >
                                        <p><strong>Request Date:</strong> {item.RequestDate}</p >

                                        {(item.ConsultationStatus === 'ready' ||
                                            item.ConsultationStatus === 'ongoing') && (
                                                <button
                                                    type="button"
                                                    className="secondary-btn"
                                                    onClick={() => openMeetingLink(item.MeetingLink)}
                                                >
                                                    Join Meeting
                                                </button>
                                            )}
                                    </div>
                                ))}

                            {userConsultationHistory.length === 0 && <p>No consultations found.</p >}
                        </section>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="app-shell">
            <section className="container">
                <header className="hero">
                    <h1>FixPath</h1>
                    <p className="subtitle">
                        Decision-support troubleshooting platform
                    </p >
                </header>

              
             
            </section>
        </div>

               
       
    );
}

export default App;