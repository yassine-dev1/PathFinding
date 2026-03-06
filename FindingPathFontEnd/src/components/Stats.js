import React from 'react';
import './Stats.css';

const Stats = ({ stats }) => {
  return (
    <div className="stats">
      <h3>Algorithm Statistics</h3>
      <table>
        <tbody>
          <tr>
            <td>Cells Visited</td>
            <td><strong>{stats.visited}</strong></td>
          </tr>
          <tr>
            <td>Path Length</td>
            <td><strong>{stats.pathLength}</strong></td>
          </tr>
        </tbody>
      </table>

      <div className="execution-time">
        <h4>Execution Time</h4>
        <div className="time-value">
          {stats.time > 0 ? `${stats.time.toFixed(2)} ms` : '--'}
        </div>
      </div>
    </div>
  );
};

export default Stats;