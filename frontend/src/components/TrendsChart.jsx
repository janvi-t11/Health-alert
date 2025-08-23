import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export default function TrendsChart() {
	const [reports, setReports] = useState([]);
	const [selectedState, setSelectedState] = useState('');
	const [viewType, setViewType] = useState('state');

	useEffect(() => {
		api.get('/reports')
			.then((r) => {
				setReports(r.data || []);
			})
			.catch(err => {
				setReports([]);
			});
	}, []);

	const stateData = useMemo(() => {
		const stateMap = new Map();
		reports.forEach((r) => {
			if (r.state && r.state.trim()) {
				stateMap.set(r.state, (stateMap.get(r.state) || 0) + 1);
			}
		});
		const labels = Array.from(stateMap.keys()).sort();
		return {
			labels,
			counts: labels.map((state) => stateMap.get(state))
		};
	}, [reports]);

	const cityData = useMemo(() => {
		const filteredReports = selectedState 
			? reports.filter(r => r.state === selectedState)
			: reports;
		const cityMap = new Map();
		filteredReports.forEach((r) => {
			if (r.city && r.city.trim()) {
				cityMap.set(r.city, (cityMap.get(r.city) || 0) + 1);
			}
		});
		const labels = Array.from(cityMap.keys()).sort();
		return {
			labels,
			counts: labels.map((city) => cityMap.get(city))
		};
	}, [reports, selectedState]);

	const filteredDiseaseData = useMemo(() => {
		let filteredReports = reports;
		if (viewType === 'state' && stateData.labels.length > 0) {
			// No filtering for state view - show all diseases
		} else if (viewType === 'city' && selectedState) {
			filteredReports = reports.filter(r => r.state === selectedState);
		}
		
		const diseaseMap = new Map();
		filteredReports.forEach((r) => {
			if (r.diseaseType) {
				diseaseMap.set(r.diseaseType, (diseaseMap.get(r.diseaseType) || 0) + 1);
			}
		});
		return {
			labels: Array.from(diseaseMap.keys()),
			counts: Array.from(diseaseMap.values())
		};
	}, [reports, viewType, selectedState]);

	const overallDiseaseData = useMemo(() => {
		const diseaseMap = new Map();
		reports.forEach((r) => {
			if (r.diseaseType) {
				diseaseMap.set(r.diseaseType, (diseaseMap.get(r.diseaseType) || 0) + 1);
			}
		});
		return {
			labels: Array.from(diseaseMap.keys()),
			counts: Array.from(diseaseMap.values())
		};
	}, [reports]);

	const maxCount = Math.max(...(viewType === 'state' ? stateData.counts : cityData.counts), 1);
	const diseaseColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

	return (
		<div>
			<div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
				<div>
					<label style={{ marginRight: 8, fontWeight: 'bold' }}>View:</label>
					<select 
						value={viewType} 
						onChange={(e) => setViewType(e.target.value)}
						style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
					>
						<option value="state">By State</option>
						<option value="city">By City</option>
					</select>
				</div>
				{viewType === 'city' && (
					<div>
						<label style={{ marginRight: 8, fontWeight: 'bold' }}>Filter by State:</label>
						<select 
							value={selectedState} 
							onChange={(e) => setSelectedState(e.target.value)}
							style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
						>
							<option value="">All States</option>
							{stateData.labels.map(state => (
								<option key={state} value={state}>{state}</option>
							))}
						</select>
					</div>
				)}
				<div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
					Total Reports: {reports.length}
				</div>
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
				<div>
					<h3 style={{ marginBottom: 16 }}>Reports {viewType === 'state' ? 'by State' : `by City${selectedState ? ` in ${selectedState}` : ''}`}</h3>
					<div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: 16, minHeight: 300 }}>
						{(viewType === 'state' ? stateData.labels : cityData.labels).map((label, index) => {
							const count = (viewType === 'state' ? stateData.counts : cityData.counts)[index];
							const percentage = (count / maxCount) * 100;
							return (
								<div key={label} style={{ marginBottom: 12 }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
										<span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
										<span style={{ fontSize: '14px', color: '#666' }}>{count}</span>
									</div>
									<div style={{ width: '100%', height: 8, backgroundColor: '#f3f4f6', borderRadius: 4 }}>
										<div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 }}></div>
									</div>
								</div>
							);
						})}
						{(viewType === 'state' ? stateData.labels : cityData.labels).length === 0 && (
							<div style={{ textAlign: 'center', color: '#666', padding: 40 }}>No data available</div>
						)}
					</div>
				</div>
				<div>
					<h3 style={{ marginBottom: 16 }}>Disease Distribution {selectedState && viewType === 'city' ? `in ${selectedState}` : '(Filtered)'}</h3>
					<div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: 16, minHeight: 300 }}>
						{filteredDiseaseData.labels.map((disease, index) => {
							const count = filteredDiseaseData.counts[index];
							const total = filteredDiseaseData.counts.reduce((a, b) => a + b, 0);
							const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
							return (
								<div key={disease} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
									<div style={{ width: 16, height: 16, backgroundColor: diseaseColors[index % diseaseColors.length], borderRadius: '50%', marginRight: 12 }}></div>
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: '14px', fontWeight: '500' }}>{disease}</div>
										<div style={{ fontSize: '12px', color: '#666' }}>{count} reports ({percentage}%)</div>
									</div>
								</div>
							);
						})}
						{filteredDiseaseData.labels.length === 0 && (
							<div style={{ textAlign: 'center', color: '#666', padding: 40 }}>No disease data available</div>
						)}
					</div>
				</div>
				<div>
					<h3 style={{ marginBottom: 16 }}>Overall Reports</h3>
					<div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: 16, minHeight: 300 }}>
						{overallDiseaseData.labels.map((disease, index) => {
							const count = overallDiseaseData.counts[index];
							const total = overallDiseaseData.counts.reduce((a, b) => a + b, 0);
							const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
							return (
								<div key={disease} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
									<div style={{ width: 16, height: 16, backgroundColor: diseaseColors[index % diseaseColors.length], borderRadius: '50%', marginRight: 12 }}></div>
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: '14px', fontWeight: '500' }}>{disease}</div>
										<div style={{ fontSize: '12px', color: '#666' }}>{count} reports ({percentage}%)</div>
									</div>
								</div>
							);
						})}
						{overallDiseaseData.labels.length === 0 && (
							<div style={{ textAlign: 'center', color: '#666', padding: 40 }}>No disease data available</div>
						)}
					</div>
				</div>
			</div>



			{reports.length === 0 && (
				<div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
					No reports available for analysis
				</div>
			)}
		</div>
	);
}