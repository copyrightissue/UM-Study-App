import React from "react";
import styles from "../styles/Login.module.css"; // Import CSS Module

const StudyBuddyLogin = () => {
    return (
        <div className={styles.loginContainer}>
            <div className={styles.logo}>
                <h1>
                    <span role="img" aria-label="book">📘</span> Study Buddy
                </h1>
            </div>

            <div className={styles.loginBox}>
                {/* Study Buddy App welcome */}
                <p className={styles.welcomeMessage}>
                    Welcome to Study Buddy!
                </p>

                {/* Login with NetID and Password */}
                <div className={styles.formContainer}>
                    <div className={styles.inputWrapper}>
                        <label className={styles.inputLabel}>NetID:</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Enter NetID"
                        />
                    </div>

                    <div className={styles.inputWrapper}>
                        <label className={styles.inputLabel}>Password:</label>
                        <input
                            type="password"
                            className={styles.inputField}
                            placeholder="Enter Password"
                        />
                    </div>

                    {/* Login Button(currently links to nothing) */}
                    <button className={styles.loginButton}>Login</button>
                </div>

                {/* New Account Link */}
                <p className={styles.newAccountLink}>
                    If you do not have an account, click the link here:{" "}
                    <a href="/signup" className={styles.noUnderline}>New Account</a>
                </p>
            </div>
        </div>
    );
};

export default StudyBuddyLogin;
