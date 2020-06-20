import React from 'react';
import { Table } from 'rimble-ui';

const BatteryTable = React.memo(({ batteriesInfo }) => {    
    return (
        <div>
            <Table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Thermal</th>
                        <th>Location</th>
                        <th>Owner</th>
                    </tr>
                </thead>
                <tbody>
                    {!batteriesInfo ? null : batteriesInfo.map(batteryInfo => (
                        <tr key={batteryInfo.id}>
                            <td>{batteryInfo.id}</td>
                            <td>{batteryInfo.thermal} °C</td>
                            <td>{batteryInfo.location[0]} / {batteryInfo.location[1]}</td>
                            <td>{batteryInfo.currentOwner}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )

});

export default BatteryTable;