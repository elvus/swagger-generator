import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Layout, Menu, Radio, Row, Select, Space, Tabs } from 'antd';
import type { RadioChangeEvent, TabsProps } from 'antd';
import { Link } from 'react-router-dom';
import * as curlconverter from 'curlconverter';
import Editable from '../components/Editable';
import Preview from '../components/Preview';
import swaggergen from '../assets/swaggergen.svg';

const { Option } = Select;
const { Header, Content } = Layout;
const formHeaders = ['application/x-www-form-urlencoded', 'multipart/form-data'];

const BodyForm: React.FC<any> = ({ bodyType, data, rowSelection, dataSource, setDataSource }) => {
	switch (bodyType) {
		case 1:
			if (data) {
				if (formHeaders.includes(data.headers['Content-Type'])) {
					return <Editable data={data?.data} rowSelection={rowSelection} dataSource={dataSource} setDataSource={setDataSource} />
				}
			}
			return <Editable rowSelection={rowSelection} dataSource={dataSource} setDataSource={setDataSource} />

		case 2:
			if (data) {
				if (data.headers['Content-Type'] === 'application/json') {
					return (
						<Form.Item>
							<Input.TextArea rows={10} value={JSON.stringify(data.data, null, 4)} />
						</Form.Item>
					);
				}
			}
			return (
				<Form.Item>
					<Input.TextArea rows={10} />
				</Form.Item>
			);
		default:
			return null;
	}
}

const BodyType: React.FC<any> = ({ bodyType, setBodyType, data, rowSelection, dataSource, setDataSource }) => {
	const onChange = ({ target: { value } }: RadioChangeEvent) => {
		setBodyType(parseInt(value));
	}

	return (
		<>
			<Row>
				<Col span={24}>
					<Radio.Group name="type" value={bodyType} onChange={onChange}>
						<Radio value={0}>none</Radio>
						<Radio value={1}>form-data</Radio>
						<Radio value={2}>JSON</Radio>
					</Radio.Group>
				</Col>
			</Row>
			<Row style={{ marginTop: 10 }}>
				<Col span={24}>
					<BodyForm bodyType={bodyType} data={data} rowSelection={rowSelection} dataSource={dataSource} setDataSource={setDataSource} />
				</Col>
			</Row>
		</>
	);
}


const App: React.FC = () => {
	const [form] = Form.useForm();
	const [swaggerType, setSwaggerType] = useState('3.0');
	const [bodyType, setBodyType] = useState(0);
	const [jsonData, setJsonData] = useState<any>();
	const [querysDataSource, setQuerysDataSource] = useState<any[]>([]);
	const [headersDataSource, setHeadersDataSource] = useState<any[]>([]);
	const [bodyDataSource, setBodyDataSource] = useState<any[]>([]);
	const [bodySelectedRows, setBodySelectedRows] = useState<React.Key[]>([]);
	const [querysSelectedRows, setQuerysSelectedRows] = useState<React.Key[]>([]);
	const [headersSelectedRows, setHeadersSelectedRows] = useState<React.Key[]>([]);

	useEffect(() => {
		setQuerysSelectedRows(querysDataSource.filter((item) => item.selected).map((item) => item.key));
	}, [querysDataSource]);

	useEffect(() => {
		setHeadersSelectedRows(headersDataSource.filter((item) => item.selected).map((item) => item.key));
	}, [headersDataSource]);

	useEffect(() => {
		setBodySelectedRows(bodyDataSource.filter((item) => item.selected).map((item) => item.key));
	}, [bodyDataSource]);

	const querysRowSelection = {
		onSelect: (record: any) => {
			querysDataSource.find((item) => item.key === record.key).selected = !record.selected;
			setQuerysDataSource([...querysDataSource]);
		},
		onSelectAll: (selected: boolean, _selectedRows: any[], changeRows: any[]) => {
			console.log(changeRows)
			changeRows.forEach((item) => {
				querysDataSource.find((data) => data.key === item.key).selected = selected;
			});
			setQuerysDataSource([...querysDataSource]);
		},
		selectedRowKeys: querysSelectedRows,
		getCheckboxProps: (record: any) => {
			if (record.key_param === '') {
				return {
					disabled: record.key_param === '', // Column configuration not to be checked
					name: record.key_param,
				}
			}
		}
	};

	const bodyRowSelection = {
		onSelect: (record: any) => {
			bodyDataSource.find((item) => item.key === record.key).selected = !record.selected;
			setBodyDataSource([...bodyDataSource]);
		},
		onSelectAll: (selected: boolean, _selectedRows: any[], changeRows: any[]) => {
			console.log(changeRows)
			changeRows.forEach((item) => {
				bodyDataSource.find((data) => data.key === item.key).selected = selected;
			});
			setBodyDataSource([...bodyDataSource]);
		},
		selectedRowKeys: bodySelectedRows,
		getCheckboxProps: (record: any) => {
			if (record.key_param === '') {
				return {
					disabled: record.key_param === '', // Column configuration not to be checked
					name: record.key_param,
				}
			}
		}
	};

	const headersRowSelection = {
		onSelect: (record: any) => {
			headersDataSource.find((item) => item.key === record.key).selected = !record.selected;
			setHeadersDataSource([...headersDataSource]);
		},
		onSelectAll: (selected: boolean, _selectedRows: any[], changeRows: any[]) => {
			console.log(changeRows)
			changeRows.forEach((item) => {
				headersDataSource.find((data) => data.key === item.key).selected = selected;
			});
			setHeadersDataSource([...headersDataSource]);
		},
		selectedRowKeys: headersSelectedRows,
		getCheckboxProps: (record: any) => {
			if (record.key_param === '') {
				return {
					disabled: record.key_param === '', // Column configuration not to be checked
					name: record.key_param,
				}
			}
		}
	};

	const items: TabsProps['items'] = [
		{
			key: '1',
			label: 'Params',
			children: <Editable data={jsonData?.queries} rowSelection={querysRowSelection} dataSource={querysDataSource} setDataSource={setQuerysDataSource} />,
		},
		{
			key: '2',
			label: 'Headers',
			children: <Editable data={jsonData?.headers} rowSelection={headersRowSelection} dataSource={headersDataSource} setDataSource={setHeadersDataSource} />,
		},
		{
			key: '3',
			label: 'Body',
			// children: <Editable data={body} />,
			children: <BodyType bodyType={bodyType} setBodyType={setBodyType} data={jsonData} rowSelection={bodyRowSelection} dataSource={bodyDataSource} setDataSource={setBodyDataSource} />,
		},
	];

	const onChange = (key: string) => {
		console.log(key);
	};

	const handleCurl = (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const { value } = e.target;
			if (value.startsWith('curl')) {
				const data = JSON.parse(curlconverter.toJsonString(value));
				setJsonData(data);
				if (formHeaders.includes(data.headers['Content-Type'])) {
					setBodyType(1);
				}else if (data.headers['Content-Type'] === 'application/json') {
					setBodyType(2);
				}else {
					setBodyType(0);
				}
				form.setFieldValue('method', data.method);
				form.setFieldValue('curl', data.raw_url);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const onChangeSwaggerType = ({ target: { value } }: RadioChangeEvent) => {
		setSwaggerType(value);
	}
	//get response
	const onGenerateHandler = async () => {
		const body: any = {
			method: jsonData.method,
			headers: jsonData.headers,
		}

		if (jsonData.method !== 'get') {
			body['body'] = jsonData.data;
		}

		const response = await fetch(jsonData.url, body);
		const data = await response.json();
		setJsonData({ ...jsonData, response: data });
	}

	const selectBefore = (
		<Form.Item name="method" noStyle>
			<Select defaultValue="get">
				<Option value="get">GET</Option>
				<Option value="post">POST</Option>
				<Option value="put">PUT</Option>
				<Option value="delete">DELETE</Option>
				<Option value="patch">PATCH</Option>
			</Select>
		</Form.Item>
	);

	return (
		<Layout>
			<Header style={{
				position: 'sticky',
				top: 0,
				zIndex: 1,
				width: '100%',
				display: 'flex',
				alignItems: 'center',
			}}>
				<Link to="/" style={{ color: 'white', marginRight: '30px' }}>
					<img
						src={swaggergen}
						alt="logo"
						style={{ width: 'auto', height: 45, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
					/>
				</Link>
				<Menu
					theme="dark"
					mode="horizontal"
					// items={items}
					defaultSelectedKeys={['2']}
					style={{ flex: 1, minWidth: 0 }}
				/>
			</Header>
			<Content style={{
				padding: 24,
				margin: 0,
				minHeight: 280
			}}>
				<Layout style={{ padding: '0 24px 24px' }}>
					<Card>
						<Form form={form} onFinish={onGenerateHandler}>
							<Form.Item>
								<Space.Compact style={{ width: '100%' }} size='large'>
									<Form.Item name="curl" noStyle>
										<Input addonBefore={selectBefore} placeholder='Paste cURL' onChange={handleCurl} autoComplete='off' />
									</Form.Item>
									<Button type="primary" htmlType='submit'>Generate</Button>
								</Space.Compact>
							</Form.Item>
							<Form.Item>
								<Radio.Group defaultValue="3.0" onChange={onChangeSwaggerType} buttonStyle="solid">
									<Radio.Button value="3.0">OpenAPI 3.0</Radio.Button>
									<Radio.Button value="2.0">Swagger 2</Radio.Button>
								</Radio.Group>
							</Form.Item>
							<Form.Item>
								<Tabs defaultActiveKey="1" items={items} onChange={onChange} />
							</Form.Item>
						</Form>
					</Card>
					<Card>
						<Preview swaggerType={swaggerType} json={jsonData} />
					</Card>
				</Layout>
			</Content>
		</Layout>
	);
};


export default App;