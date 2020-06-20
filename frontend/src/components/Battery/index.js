import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import { Box } from 'rimble-ui';

import api from '../../services/api';
import styles from './styles.module.css';

import BatteryTable from './batteryTable';

const Battery = () => {

    const [batteriesInfo, setBatteriesInfo] = useState([]);

    const [cookies, setCookie, removeCookie] = useCookies();

    const history = useHistory();

    useEffect(() => {
        if (!cookies.distributorJWT || !cookies.address) {
            history.push('/wrong', { message: "Shouldn't you be logged in?" });
            return function cleanup() { }
        }

        try {
            api
                .get('/distributors/getBatteries', { withCredentials: true })
                .then(res => {
                    if (res.status === 200) {
                        handleGetBatteryInfo(res.data.batteries);
                    } else {
                        history.push('/wrong');
                        return function cleanup() { }
                    }
                })
                .catch(err => {
                    history.push('/wrong', { 'message': err });
                    return function cleanup() { }
                });
        } catch (error) {
            alert('Fail.');
        }
    }, []);

    function handleGetBatteryInfo(batteryIds) {
        batteryIds.map(id => {
            try {
                api
                    .get(`distributors/batteryInfo/${id}`, { withCredentials: true })
                    .then(res => {
                        if (res.status === 200) {
                            const newInfo = {
                                id: id,
                                thermal: res.data.thermal,
                                location: res.data.location,
                                currentOwner: res.data.currentOwner
                            }
                            setBatteriesInfo(batteriesInfo => [...batteriesInfo, newInfo]);
                        } else {
                            history.push('/wrong');
                            return function cleanup() { }
                        }
                    })
                    .catch(err => {
                        history.push('/wrong', { 'message': err });
                        return function cleanup() { }
                    });
            } catch (error) {
                alert('Fail.');
            }
        })
    }

    function handleClickLogout() {
        removeCookie('distributorJWT');
        removeCookie('address');
        history.push('/login');
    }

    return (
        <Box my={50} mx={100} fontSize={4} p={3}>
            <header className={styles.header_container}>
                <h2>Battery Current Conditions</h2>
                <div>
                    <button onClick={handleClickLogout}>Logout</button>
                </div>
            </header>
            <BatteryTable batteriesInfo={batteriesInfo} />
        </Box>
    );
}

export default Battery;