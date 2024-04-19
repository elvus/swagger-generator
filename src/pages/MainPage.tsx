import React from 'react';
import { Button, Card, Col, Form, Input, Layout, Menu, Radio, Row, Select, Space, Tabs } from 'antd';
import type { RadioChangeEvent, TabsProps } from 'antd';
import { Link } from 'react-router-dom';
import * as curlconverter from 'curlconverter';
import Editable from '../components/Editable';
import Preview from '../components/Preview';

const { Option } = Select;
const { Header, Content } = Layout;

const App: React.FC = () => {
	const [form] = Form.useForm();
	const [swaggerType, setSwaggerType] = React.useState('3.0');
	const [bodyType, setBodyType] = React.useState(0);
	const [jsonData, setJsonData] = React.useState<any>();

	const BodyType: React.FC<any> = ({data}) => {
		const onChange = ({target: { value } }: RadioChangeEvent) => {
			setBodyType(parseInt(value));
		}

		const BodyForm = () =>{
			switch (bodyType) {
				case 1:
					return (
						<Editable data={data} />
					);
				case 2:
					return (
						<Form.Item>
							<Input.TextArea rows={10} value={JSON.stringify(data, null, 4)}/>
						</Form.Item>
					);
				default:
					return null;
			}
		}
	
		return (
			<>
				<Row>
					<Col span={24}>
						<Radio.Group value={bodyType} onChange={onChange}>
							<Radio value={0}>none</Radio>
							<Radio value={1}>form-data</Radio>
							<Radio value={2}>JSON</Radio>
						</Radio.Group>
					</Col>
				</Row>
				<Row style={{marginTop: 10}}>
					<Col span={24}>
						<BodyForm/>
					</Col>
				</Row>		
			</>
		);
	}

	const items: TabsProps['items'] = [
		{
			key: '1',
			label: 'Params',
			children: <Editable data={jsonData?.queries} />,
		},
		{
			key: '2',
			label: 'Headers',
			children: <Editable data={jsonData?.headers}/>,
		},
		{
			key: '3',
			label: 'Body',
			// children: <Editable data={body} />,
			children: <BodyType data={jsonData?.data} />,
		},
	];

	const onChange = (key: string) => {
		console.log(key);
	};

	const handleCurl = (e: React.ChangeEvent<HTMLInputElement>) => {
		try{
			const { value } = e.target;
			if(value.startsWith('curl')){
				const data = JSON.parse(curlconverter.toJsonString(value));
				setJsonData(data);
				setBodyType(0);
				form.setFieldValue('method', data.method);
				form.setFieldValue('curl', data.raw_url);
			}else{
				setJsonData({
					url: value,
					method: form.getFieldValue('method'),
					headers: {},
					queries: {},
					data: "",
					response: {},
				});
			}
		}catch(err){
			console.log(err);
		}
	};

	const onChangeSwaggerType = ({target: { value } }: RadioChangeEvent) => {
		setSwaggerType(value);
	}
	//get response
	const onGenerateHandler = async () => {
		const body:any = {
			method: jsonData.method,
			headers: jsonData.headers,
		}
		
		if(jsonData.method !== 'get'){
			body['body'] = jsonData.data;
		}

		const response = await fetch(jsonData.url, body);
		const data = await response.json();
		setJsonData({...jsonData, response: data});
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
						src="https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png"
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
										<Input addonBefore={selectBefore} placeholder='Paste cURL' onChange={handleCurl} autoComplete='off'/>
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