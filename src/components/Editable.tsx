import React, { useContext, useEffect, useRef, useState } from 'react';
import type { GetRef } from 'antd';
import { Form, Input, Table } from 'antd';

type InputRef = GetRef<typeof Input>;
type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key: string;
  selected: boolean;
  key_param: string;
  value_param: string;
  description_param: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
  handleAddNewRow: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  handleAddNewRow,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  const addNewRow = () => {
    handleAddNewRow(record);
  }

  let childNode = children;
  if (editable) {
    childNode = editing ? (
        <Form.Item
          style={{ margin: 0}}
          name={dataIndex}
        >
          <Input ref={inputRef} placeholder={title as string} onPressEnter={save} onBlur={save} onInput={addNewRow} />
        </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {record[dataIndex] ? record[dataIndex] : <span style={{ color: 'gray' }}>{title}</span>}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];


type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const Editable: React.FC<any> = ({data, rowSelection, dataSource, setDataSource}) => {
	const defaultData = [
		{
			key: (dataSource.length + 1).toString(),
      selected: false,
			key_param: '',
			value_param: '',
			description_param: '',
		},
	];
  
	useEffect(() => {
    let newData: Item[] = [];
    for(let key in data) {
      newData.push({
        key: key,
        selected: true,
        key_param: key,
        value_param: data[key],
        description_param: ''
      });
    }
		setDataSource(newData ? [...newData, ...defaultData] : defaultData);
	}, [data]);
    
  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'Key',
      dataIndex: 'key_param',
      width: '30%',
      editable: true,
    },
    {
      title: 'Value',
      width: '30%',
      dataIndex: 'value_param',
      editable: true,
    },
    {
      title: 'Description',
      width: '30%',
      dataIndex: 'description_param',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      key: 'operation',
      render: (_) =>
        dataSource.length >= 1 ? (
            <a>Delete</a>
        ) : null,
    },
  ];

  const handleSave = (row: Item) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    // set selected property to true
    row.selected = true;
    // If the key is the same, update the value
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const handleAddNewRow = (row: Item) => {
    if (row.key === dataSource[dataSource.length - 1].key) {
      setDataSource([...dataSource, {
        key: (dataSource.length + 1).toString(),
        selected: false,
        key_param: '',
        value_param: '',
        description_param: ''
      }]);
    }
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        handleAddNewRow,
      }),
    };
  });

  return (
    <div>
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection
        }}
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
				pagination={false}
      />
    </div>
  );
};

export default Editable;