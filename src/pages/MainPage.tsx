import React from 'react';
import { Button, Card, Form, Input, Layout, Menu, Radio, Select, Space, Tabs } from 'antd';
import type { RadioChangeEvent, TabsProps } from 'antd';
import { Link } from 'react-router-dom';
import Editable from '../components/Editable';
import Preview from '../components/Preview';

const { Option } = Select;
const { Header, Content } = Layout;


const App: React.FC = () => {
	const [form] = Form.useForm();
	const [curl, setCurl] = React.useState<any>({});
	const [method, setMethod] = React.useState('get');
	const [urlAttr, setUrlAttr] = React.useState({});
	const [body, setBody] = React.useState<any>([]);
	const [headers, setHeaders] = React.useState<any>([]);
	const [params, setParams] = React.useState<any>([]);
	const [swaggerType, setSwaggerType] = React.useState('3.0');
	const [response, setResponse] = React.useState();

	const checkUrl = (array: any) => {
		let value = null;
		for (let i = 0; i < array.length; i++) {
			const url = array[i].replaceAll('\'', '').replaceAll('"', '');
			if (url.startsWith('http')) {
				value = url;
				break;
			}
		}

		return value;
	}

	const paramsToObject = (entries: any) => {
		const result: any = {}
		for (const [key, value] of entries) { // each 'entry' is a [key, value] tupple
			result[key] = value;
		}
		return result;
	}

	const extractURLParams = (url: string) => {
		const queryString = url.split('?')[1];
		const urlParams = new URLSearchParams(queryString);
		const entries = urlParams.entries(); //returns an iterator of decoded [key,value] tuples
		const params = paramsToObject(entries);
		return params;
	}



	const optionsToJson = (_old_data: any, new_data: any, option_name: string) => {
		let option = null
		try {
			if (typeof _old_data === 'object' && JSON.stringify(_old_data) !== '{}') {
				option = _old_data.option_text + ' ' + new_data.join(' ');
			} else {
				option = new_data.join(' ');
			}
		} catch (error) {
			console.log(error);
		}

		if (option.includes('http')) {
			option = option.split('http')[0].trim();
		}

		let option_array = option.replaceAll(' \\', '').replaceAll('\'', '').replaceAll('"', '');
		let key = '';
		let value = '';

		option_array.split(' ').forEach((item: string) => {
			if (item.endsWith(':')) {
				key = item.slice(0, -1).trim();
			} else {
				value = `${value} ${item}`.trim();
			}
		});

		const result: any = {};
		result['option_text'] = option;
		result[option_name] = { key, value };
		return result;
	}

	const curlOptions = [
		// {
		//   name: 'url',
		//   alias: ['url', 'curl'],
		//   type: 'url',
		//   func: (_old_data: any, new_data: any, option_name: string) =>{
		//     const result: any = {}
		//     result[option_name] = checkUrl(new_data);
		//     return result; 
		//   }
		// },
		{
			name: 'cookie',
			alias: ['b', 'cookie'],
			type: 'json',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},
		{
			name: 'cookie-jar',
			alias: ['c', 'cookie-jar'],
			type: 'json',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},
		{
			name: 'data',
			alias: ['d', 'data', 'data-raw', 'data-urlencode', 'data-binary'],
			type: 'json',
			func: (_old_data: any, new_data: any, option_name: any) => {
				let result: any = {};
				let data = new_data.join(' ').replaceAll('\'', '');

				if (data.startsWith('{') && data.endsWith('}')) {
					try {
						result[option_name] = JSON.parse(data);
						return result;
					} catch (error) {
						console.log(error);
					}
				} else if (data.indexOf('=') !== -1) {
					data = data.replaceAll('"', '').replaceAll("'", '');
					const urlParams = new URLSearchParams(data);
					const entries = urlParams.entries(); //returns an iterator of decoded [key,value] tuples
					const params = paramsToObject(entries);
					//console.log('params', params);
					if (Object.keys(params).length === 1) {
						Object.keys(params).forEach((key) => {
							result[option_name] = { key, value: params[key] };
						});
					} else {
						result[option_name] = params;
					}
				} else {
					result = optionsToJson(_old_data, new_data, option_name);
				}
				return result;
			}
		},
		/*-f, --fail Fail silently (don't output HTML error form if returned).*/
		{
			name: 'fail',
			alias: ['f', 'fail'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},
		// -F, --form <name=content> Submit form data.
		{
			name: 'form',
			alias: ['F', 'form'],
			type: 'json',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},
		// -H, --header <header> Headers to supply with request.
		{
			name: 'header',
			alias: ['H', 'header'],
			type: 'json',
			convertor: 'header',
			func: (_old_data: any, new_data: any, option_name: string) => {
				return optionsToJson(_old_data, new_data, option_name);
			}
		},

		// -i, --include Include HTTP headers in the output.
		{
			name: 'include',
			alias: ['i', 'include'],
			type: 'json',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},

		// -I, --head Fetch headers only.
		{
			name: 'head',
			alias: ['I', 'head'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},

		// -k, --insecure Allow insecure connections to succeed.
		{
			name: 'insecure',
			alias: ['k', 'insecure'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},

		// -L, --location Follow redirects.
		// {
		//   name: 'location',
		//   alias: ['L', 'location'],
		//   type: 'url',
		//   func: (_old_data: any, new_data: any, option_name: string) =>{
		//     const result: any = {}
		//     result[option_name] = checkUrl(new_data);
		//     return result;
		//   }
		// },

		// -o, --output <file> Write output to . Can use --create-dirs in conjunction with this to create any directories specified in the -o path.
		{
			name: 'output',
			alias: ['o', 'output'],
			type: 'json',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},

		// -O, --remote-name Write output to file named like the remote file (only writes to current directory).
		{
			name: 'remote-name',
			alias: ['remote-name', 'O'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},

		// -s, --silent Silent (quiet) mode. Use with -S to force it to show errors.
		{
			name: 'silent',
			alias: ['s', 'silent'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},

		// -v, --verbose Provide more information (useful for debugging).
		{
			name: 'verbose',
			alias: ['v', 'verbose'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},

		// -w, --write-out <format> Make curl display information on stdout after a completed transfer. See man page for more details on available variables. Convenient way to force curl to append a newline to output: -w "\n" (can add to ~/.curlrc).
		{
			name: 'write-out',
			alias: ['write-out', 'w'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},

		// -X, --request The request method to use.
		{
			name: 'method',
			alias: ['X', 'request'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				setMethod(new_data[0].toLowerCase());
				form.setFieldsValue({
					method: new_data[0].toLowerCase() || 'get'
				});
			}
		},

		// -A, --user-agent <name>
		{
			name: 'user-agent',
			alias: ['A', 'user-agent'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},

		// -e, --referer <URL>
		{
			name: 'referer',
			alias: ['e', 'referer'],
			type: 'text',
			func: (_old_data: any, new_data: any, option_name: string) => {
				const result: any = {}
				result[option_name] = new_data;
				return result;
			}
		},
	]

	const items: TabsProps['items'] = [
		{
			key: '1',
			label: 'Params',
			children: <Editable data={params} />,
		},
		{
			key: '2',
			label: 'Headers',
			children: <Editable data={headers} />,
		},
		{
			key: '3',
			label: 'Body',
			children: <Editable data={body} />,
		},
	];

	const onChange = (key: string) => {
		console.log(key);
	};

	const extractCurlOptions = (curl: string[]) => {
		let new_obj = curl;
		curl.forEach((item, index) => {
			if (item.startsWith('-')) {
				new_obj = curl.slice(0, index).filter(Boolean);
				return true;
			}
			return false;
		});

		if (curl.length !== new_obj.length) {
			new_obj = extractCurlOptions(new_obj)
		}
		return new_obj
	};

	const handleCurl = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const json_curl: any = {};
		const raw_curl = value.split(' ');
		raw_curl.forEach((item, index) => {
			//convert curl to json
			if (item.startsWith('-')) {
				const option = curlOptions.find((option) => option.alias.includes(item.replace(/(-)+/, '')));
				if (option) {
					const curl_array = raw_curl.slice(index + 1).filter(Boolean);
					let result: any = {}
					result = option.func(result, extractCurlOptions(curl_array), option.name)
					if (!json_curl.hasOwnProperty(option.name)) {
						json_curl[option.name] = {};
					}

					if (typeof result === 'object' && JSON.stringify(result) !== '{}' && result !== null) {
						if (result[option.name].hasOwnProperty('key')) {
							if (result[option.name].hasOwnProperty('value')) {
								json_curl[option.name][result[option.name]['key']] = result[option.name]['value'];
							}
						} else {
							json_curl[option.name] = result[option.name];
						}
					}
				}
			}
		});

		if (!json_curl.hasOwnProperty('url')) {
			json_curl['url'] = checkUrl(raw_curl);
			//check query params
			const url = new URL(json_curl['url']);
			setUrlAttr({
				protocol: url.protocol,
				host: url.host,
				basePath: url.pathname,			
			});

			const query = url.search;
			if (query) {
				const params = extractURLParams(json_curl['url']);
				setParams(Object.keys(params).map((key) => {
					return {
						key: key,
						key_param: key,
						value_param: params[key],
						description_param: '',
					}
				}));
			}
		}

		if (json_curl.hasOwnProperty('header')) {
			setHeaders(Object.keys(json_curl['header']).map((key) => {
				return {
					key: key,
					key_param: key,
					value_param: json_curl['header'][key],
					description_param: '',
				}
			}));
		}

		if (json_curl.hasOwnProperty('data')) {
			setMethod('post');
			form.setFieldsValue({
				method: 'post'
			});
			setBody(Object.keys(json_curl['data']).map((key) => {
				return {
					key: key,
					key_param: key,
					value_param: json_curl['data'][key],
					description_param: '',
				}
			}));
		}
		setCurl(json_curl);
		form.setFieldsValue({
			curl: json_curl['url']
		});
	};

	const onChangeSwaggerType = ({target: { value } }: RadioChangeEvent) => {
		setSwaggerType(value);
	}
	//get response
	const onGenerateHandler = async () => {
		console.log("submitting...");
		const response = await fetch(curl.url, {
			method: form.getFieldValue('method'),
			headers: curl.headers,
			body: curl.body,
		});
		const data = await response.json();
		setResponse(data);
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
						<Preview swaggerType={swaggerType} method={method} json={{ "urlAttr": urlAttr, "headers": headers, "query": params, "body": body, "response": response }} />
					</Card>
				</Layout>
			</Content>
		</Layout>
	);
};

export default App;