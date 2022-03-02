import React from "react";
import { Collapse, Table } from "@douyinfe/semi-ui";
import styles from '../assets/styles/Faq.module.scss';
import { useAnalytics } from '../utils/GoogleGA';
export const Faq: React.FC = () => {
  useAnalytics('FAQ');
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
      price: '2.00 T Cycles',
      year: '2.00 T Cycles',
    },
    {
      key: '2',
      name: '6',
      price: '2.20 T Cycles',
      year: '2.20 T Cycles',
    },
    {
      key: '3',
      name: '5',
      price: '2.42 T Cycles',
      year: '2.42 T Cycles',
    },
    {
      key: '4',
      name: '4',
      price: '2.66 T Cycles',
      year: '2.66 T Cycles',
    },
    {
      key: '5',
      name: '3',
      price: '2.92 T Cycles',
      year: '2.92 T Cycles',
    },
    {
      key: '6',
      name: '2',
      price: '3.22 T Cycles',
      year: '3.22 T Cycles',
    },
    {
      key: '7',
      name: '1',
      price: '3.54 T Cycles',
      year: '3.54 T Cycles',
    }
  ]
  return (
    <div className="container pt-5">
      <div className={styles['faq-wrap']}>
        <div style={{ paddingTop: "20px" }}>
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
              <Table columns={columns} dataSource={data} pagination={false} className={styles['faq-table']} />
            </Collapse.Panel>
            <Collapse.Panel header="What is cycles? " itemKey="Panel5">
              <p>Simply remember that 1T cycles is about $1.40, which is relatively fixed.</p>
              <p>And ICP uses the market price. Let's say $20.</p>
              <p>Then 1T cycles is equal to 1.4 / 20 = 0.07 ICP.</p>
              <p><a target="_blank" rel="noreferrer" href="https://smartcontracts.org/docs/developers-guide/concepts/tokens-cycles.html">(https://smartcontracts.org/docs/developers-guide/concepts/tokens-cycles.html)</a></p>
            </Collapse.Panel>
            <Collapse.Panel header="How to pay cycles?" itemKey="Panel6">
              <p>What you will actually have to pay is ICP.This will be converted at the time of order creation using the latest cycles/ICP rate from NNS.</p>
            </Collapse.Panel>
            <Collapse.Panel header="Can I use it for a decentralized website deployed on IC?" itemKey="Panel7">
              <p>Yes, you can use our browser extension to access your decentralized website directly through chrome browser </p>
            </Collapse.Panel>
            <Collapse.Panel header="Once I own a name, can I create my own subdomains?" itemKey="Panel8">
              <p>Yes. You can create whatever subdomains you wish and assign ownership of them to other people if you desire. You can even set up your own registrar for your domain. </p>
            </Collapse.Panel>
            <Collapse.Panel header="Where is the source code of IC Naming?" itemKey="Panel9">
              <p>You can find out the source code of IC Naming from https://github.com/IC-Naming/icnaming, including smart contract in canister, browser extensions and etc.</p>
            </Collapse.Panel>
          </Collapse>
        </div>
      </div>
    </div>
  )
}