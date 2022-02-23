import React from "react";
import { Collapse, Table } from "@douyinfe/semi-ui";
export const Faq: React.FC = () => {
  const columns = [
    {
      title: 'Name Length',
      dataIndex: 'name',
    },
    {
      title: 'Register Price/Year',
      dataIndex: 'price',
    },
    {
      title: 'Renewal Price/Year',
      dataIndex: 'year',
    },
  ]
  const data = [
    {
      key: '1',
      name: '>=7',
      price: 'ICP equivalent to 2.00 T Cycles',
      year: 'Same as Register',
    },
    {
      key: '2',
      name: '6',
      price: 'ICP equivalent to 2.20 T Cycles',
      year: 'Same as Register',
    },
    {
      key: '3',
      name: '5',
      price: 'ICP equivalent to 2.42 T Cycles',
      year: 'Same as Register',
    },
    {
      key: '4',
      name: '4',
      price: 'ICP equivalent to 2.66 T Cycles',
      year: 'Same as Register',
    },
    {
      key: '5',
      name: '3',
      price: 'ICP equivalent to 2.93 T Cycles',
      year: 'Same as Register',
    },
    {
      key: '6',
      name: '2',
      price: 'ICP equivalent to 3.22 T Cycles',
      year: 'Same as Register',
    },
    {
      key: '7',
      name: '1',
      price: 'ICP equivalent to 3.54 T Cycles',
      year: 'Same as Register',
    }
  ]
  return (
    <div className="container pt-5">
      <div style={{
        maxWidth: 960,
        margin: 'auto',
        paddingTop: '2.75rem',
        paddingBottom: 100
      }}>
        <div style={{ paddingTop: "20px", color: '#fff' }}>
          <Collapse accordion>
            <Collapse.Panel header="What's IC Naming?" itemKey="Panel1">
              <p>IC Naming is a decentralized name service on IC. </p>
            </Collapse.Panel>
            <Collapse.Panel header="What are IC Naming's name registration rules? " itemKey="Panel2">
              <p>Contains letters (lowercase a-z), numbers (0-9), and hyphens ('-'), with a maximum length of 63 characters</p>
            </Collapse.Panel>
            <Collapse.Panel header="How to get an IC Naming name?" itemKey="Panel3">
              <p>Currently open ≥ 7-digit name registration, anyone can register</p>
            </Collapse.Panel>
            <Collapse.Panel header="What is the registration fee and renewal fee for name?" itemKey="Panel4">
              <Table columns={columns} dataSource={data} pagination={false} />
            </Collapse.Panel>
            <Collapse.Panel header="Can I use it for a decentralized website deployed on IC?" itemKey="Panel5">
              <p>Yes, you can use our browser extension to access your decentralized website directly through chrome browser </p>
            </Collapse.Panel>
            <Collapse.Panel header="Once I own a name, can I create my own subdomains?" itemKey="Panel6">
              <p>Yes. You can create whatever subdomains you wish and assign ownership of them to other people if you desire. You can even set up your own registrar for your domain. </p>
            </Collapse.Panel>
            <Collapse.Panel header="Where is the source code of IC Naming?" itemKey="Panel7">
              <p>You can find out the source code of IC Naming from https://github.com/IC-Naming/icnaming, including smart contract in canister, browser extensions and etc.</p>
            </Collapse.Panel>
          </Collapse>
        </div>
      </div>
    </div>
  )
}