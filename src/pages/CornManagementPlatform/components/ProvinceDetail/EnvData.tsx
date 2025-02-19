
import { Table } from 'antd';
import { useEffect, useState } from 'react';
const { Column, ColumnGroup } = Table;

const EnvData = (data) => {

  const [envData, setEnvData] = useState([
    // { "1": 1, "2": 2, "3": 3 },
    // { 1: 1, 2: 2, 3: 3 },
    // { 1: 1, 2: 2, 3: 3 },
    // { 1: 1, 2: 2, 3: 3 },
    // { 1: 1, 2: 2, 3: 3 },
    // { 1: 1, 2: 2, 3: 3 },
  ])
  useEffect(() => {
    console.log(data);
    setEnvData([])
  }, [])

  return (
    <div className="env_data_container">
      <div className="table_item"
      style={{
        marginTop:"4vh",
        minHeight:"50vh"}}
      >
        <Table
          dataSource={envData}
          pagination={{
            pageSize: 3,
            showSizeChanger: false, // 禁用每页条数切换
          }}
        >
          <ColumnGroup title="环境数据">
            <Column title="01" dataIndex="1" key="1" />
            <Column title="02" dataIndex="2" key="2" />
            <Column title="03" dataIndex="3" key="3" />
            <Column title="04" dataIndex="4" key="4" />
            <Column title="05" dataIndex="5" key="5" />
            <Column title="06" dataIndex="6" key="6" />
          </ColumnGroup>
        </Table>
      </div>
    </div >
  )
}

export default EnvData;