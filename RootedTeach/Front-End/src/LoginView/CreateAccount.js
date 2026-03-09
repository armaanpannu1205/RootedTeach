import React, { useState } from "react";
import "./HomePage.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function CreateAccount({ onClose }) {
  const [role, setRole]                   = useState("student");
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [dob, setDob]                     = useState("");
  const [gender, setGender]               = useState("");
  const [phone, setPhone]                 = useState("");
  const [address, setAddress]             = useState("");
  const [city, setCity]                   = useState("");
  const [state, setState]                 = useState("");
  const [zip, setZip]                     = useState("");
  const [school, setSchool]               = useState("");
  const [schoolDistrict, setSchoolDistrict] = useState("");
  const [grade, setGrade]                 = useState("");
  const [studentId, setStudentId]         = useState("");
  const [parentName, setParentName]       = useState("");
  const [parentEmail, setParentEmail]     = useState("");
  const [parentPhone, setParentPhone]     = useState("");
  const [subject, setSubject]             = useState("");
  const [teacherId, setTeacherId]         = useState("");
  const [yearsExp, setYearsExp]           = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [error, setError]                 = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6)          { setError("Password must be at least 6 characters."); return; }
    alert(`Account created for ${firstName} ${lastName} (${role})!`);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const GRADES = ["Kindergarten","1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th","College/University"];
  const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <form className="modal" onSubmit={handleCreate}>
        <button type="button" className="modal-close" onClick={onClose}>×</button>

        <h2>Create Account</h2>

        {/* Role selector */}
        <div className="role-selector">
          <button type="button" className={`role-btn ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>🎒 Student</button>
          <button type="button" className={`role-btn ${role === "teacher" ? "active" : ""}`} onClick={() => setRole("teacher")}>🏫 Teacher</button>
        </div>

        {/* ── PERSONAL INFORMATION ── */}
        <div className="form-section">
          <div className="form-section-title">Personal Information</div>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>First Name <span className="req">*</span></label></td>
                <td><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" required /></td>
                <td><label>Last Name <span className="req">*</span></label></td>
                <td><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" required /></td>
              </tr>
              <tr>
                <td><label>Date of Birth <span className="req">*</span></label></td>
                <td><input type="date" value={dob} onChange={e => setDob(e.target.value)} required style={{ colorScheme: "dark" }} /></td>
                <td><label>Gender</label></td>
                <td>
                  <select value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="">Prefer not to say</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-binary</option>
                    <option>Other</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td><label>Phone</label></td>
                <td><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" /></td>
                <td><label>Address</label></td>
                <td><input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" /></td>
              </tr>
              <tr>
                <td><label>City</label></td>
                <td><input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" /></td>
                <td><label>State</label></td>
                <td>
                  <select value={state} onChange={e => setState(e.target.value)}>
                    <option value="">Select state</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
              <tr>
                <td><label>ZIP Code</label></td>
                <td><input type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="ZIP" maxLength={5} /></td>
                <td></td><td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── SCHOOL INFORMATION ── */}
        <div className="form-section">
          <div className="form-section-title">School Information</div>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>School Name <span className="req">*</span></label></td>
                <td><input type="text" value={school} onChange={e => setSchool(e.target.value)} placeholder="School name" required /></td>
                <td><label>District</label></td>
                <td><input type="text" value={schoolDistrict} onChange={e => setSchoolDistrict(e.target.value)} placeholder="School district" /></td>
              </tr>

              {role === "student" ? (<>
                <tr>
                  <td><label>Grade <span className="req">*</span></label></td>
                  <td>
                    <select value={grade} onChange={e => setGrade(e.target.value)} required>
                      <option value="" disabled>Select grade</option>
                      {GRADES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </td>
                  <td><label>Student ID</label></td>
                  <td><input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student ID #" /></td>
                </tr>
              </>) : (<>
                <tr>
                  <td><label>Subject <span className="req">*</span></label></td>
                  <td><input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Math, English" required /></td>
                  <td><label>Teacher ID</label></td>
                  <td><input type="text" value={teacherId} onChange={e => setTeacherId(e.target.value)} placeholder="Teacher ID #" /></td>
                </tr>
                <tr>
                  <td><label>Years Teaching</label></td>
                  <td><input type="number" value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="e.g. 5" min={0} max={60} /></td>
                  <td></td><td></td>
                </tr>
              </>)}
            </tbody>
          </table>
        </div>

        {/* ── PARENT/GUARDIAN (students only) ── */}
        {role === "student" && (
          <div className="form-section">
            <div className="form-section-title">Parent / Guardian</div>
            <table className="form-table">
              <tbody>
                <tr>
                  <td><label>Parent Name</label></td>
                  <td><input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Full name" /></td>
                  <td><label>Parent Email</label></td>
                  <td><input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="parent@email.com" /></td>
                </tr>
                <tr>
                  <td><label>Parent Phone</label></td>
                  <td><input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="(555) 000-0000" /></td>
                  <td></td><td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── ACCOUNT DETAILS ── */}
        <div className="form-section">
          <div className="form-section-title">Account Details</div>
          <table className="form-table">
            <tbody>
              <tr>
                <td><label>Email <span className="req">*</span></label></td>
                <td colSpan={3}><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></td>
              </tr>
              <tr>
                <td><label>Password <span className="req">*</span></label></td>
                <td>
                  <div className="input-wrapper">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </button>
                  </div>
                </td>
                <td><label>Confirm <span className="req">*</span></label></td>
                <td>
                  <div className="input-wrapper">
                    <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
                    <button type="button" className="toggle-password" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                      {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="submit-btn">Create Account</button>

        <div className="ForgotPassword">
          Already have an account?{" "}
          <span className="link-text" onClick={onClose}>Sign in</span>
        </div>
      </form>
    </div>
  );
}

export default CreateAccount;