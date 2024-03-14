import React, { useContext, useEffect, useRef, useState } from 'react';
import type { GetRef } from 'antd';
import { Form, Input, Row, Table } from 'antd';

type InputRef = GetRef<typeof Input>;
type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key: string;
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

interface DataType {
  key: React.Key;
  key_param: string;
  value_param: string;
  description_param: string;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

interface data{
    data?: DataType[]
}

const Editable: React.FC<data> = ({data}) => {
	const defaultData = [
		{
			key: '1',
			key_param: '',
			value_param: '',
			description_param: '',
		},
	];
  const [dataSource, setDataSource] = useState<DataType[]>([]);
	useEffect(() => {
		setDataSource(data ? [...data, ...defaultData] : defaultData);
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
      render: (_, record: { key: React.Key }) =>
        dataSource.length >= 1 ? (
            <a>Delete</a>
        ) : null,
    },
  ];

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const handleAddNewRow = (row: DataType) => {
    console.log(row);
    if (row.key === dataSource[dataSource.length - 1].key) {
      setDataSource([...dataSource, {
        key: (dataSource.length + 1).toString(),
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
      onCell: (record: DataType) => ({
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