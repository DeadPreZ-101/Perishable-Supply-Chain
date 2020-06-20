import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import api from '../../services/api';

import styles from './styles.module.css'

const Login = () => {

    const [cookies, setCookie] = useCookies();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    function handleLoginChange(e) {
        setName(e.target.value);
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault();
        try {
            api
                .post('/distributors/login', { name, password })
                .then(res => {
                    if (res.status === 200) {
                        setCookie('distributorJWT', res.data.distributorJWT);
                        setCookie('address', res.data.address);
                        history.push('/battery');
                    } else {
                        history.push('/wrong', { message: 'Invalid Username/Password' });
                        return function cleanup() { }
                    }
                })
                .catch(() => {
                    history.push('/wrong', { message: 'Invalid Username/Password' });
                    return function cleanup() { }
                });
        } catch (error) {
            alert('Fail to Login! Try again.');
        }
    }

    return (
        <div className={styles.login_container}>
            <div className={styles.content}>
                <div className={styles.content_items}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h1>Login</h1>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Username"
                            value={name}
                            onChange={handleLoginChange}
                            required />
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={handlePasswordChange}
                            required />
                        <div className={styles.buttons}>
                            <a>
                                <button id="buttonLogin">
                                    Login
                                </button>
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;