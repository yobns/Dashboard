import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Select,
  Collapse,
  Button,
} from "antd";
import {
  BankOutlined,
  FileExcelOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./Companies.css";
import FileStatsChart from "../../Components/FileStatsChart/FileStatsChart";

const { Option } = Select;

const Companies = () => {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalCompanies: 0,
    totalFiles: 0,
    totalStructures: 0,
  });
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [headers, setHeaders] = useState([]);
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const [showStructures, setShowStructures] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [selectedCompany]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params =
        selectedCompany !== "all" ? { companyName: selectedCompany } : {};
      const [
        totalCompaniesResponse,
        totalFilesResponse,
        totalStructuresResponse,
        allStructuresResponse,
      ] = await Promise.all([
        axios.get(`${import.meta.env.VITE_SERVER_URL}/chart/totalCompanies`, {
          params,
          withCredentials: true,
        }),
        axios.get(`${import.meta.env.VITE_SERVER_URL}/chart/totalFiles`, {
          params,
          withCredentials: true,
        }),
        axios.get(`${import.meta.env.VITE_SERVER_URL}/chart/totalStructures`, {
          params,
          withCredentials: true,
        }),
        axios.get(`${import.meta.env.VITE_SERVER_URL}/structure/getAll`, {
          withCredentials: true,
        }),
      ]);

      setTotals({
        totalCompanies: totalCompaniesResponse.data.totalCompanies,
        totalFiles: totalFilesResponse.data.totalFiles,
        totalStructures: totalStructuresResponse.data.totalStructures,
      });

      const filesResponse = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/file/getFiles`,
        { withCredentials: true }
      );
      setCompanies([
        ...new Set(filesResponse.data.map((file) => file.companyName)),
      ]);

      setHeaders(allStructuresResponse.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeaders = (headers, companyName) => {
    const uniqueHeaders = filterUniqueHeaders(headers);

    const isExpanded = expandedCompanies[companyName] || false;
    const visibleHeaders = isExpanded
      ? uniqueHeaders
      : uniqueHeaders.slice(0, 3);

    return (
      <>
        <ul className="ulHeaders">
          {visibleHeaders.map((headerGroup, index) => (
            <li key={index}>{headerGroup.join(" - ")}</li>
          ))}
          {uniqueHeaders.length > 3 && (
            <Button
              type="link"
              onClick={() => toggleCompanyHeaders(companyName)}
              style={{ marginTop: "10px" }}
            >
              {isExpanded ? "View Less" : "View More"}
            </Button>
          )}
        </ul>
      </>
    );
  };

  const filterUniqueHeaders = (headers) => {
    const uniqueHeaders = [];
    headers.forEach((header) => {
      if (
        !uniqueHeaders.some(
          (uniqueHeader) => uniqueHeader.join(" - ") === header.join(" - ")
        )
      ) {
        uniqueHeaders.push(header);
      }
    });
    return uniqueHeaders;
  };

  const toggleCompanyHeaders = (companyName) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const filteredHeaders =
    selectedCompany === "all"
      ? headers
      : headers.filter((header) => header.companyName === selectedCompany);

  const items = filteredHeaders.map((company, index) => ({
    key: index.toString(),
    label: company.companyName,
    children: (
      <ul className="ulHeaders">
        {renderHeaders(company.expectedHeaders, company.companyName)}
      </ul>
    ),
  }));

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "80%", maxWidth: "1200px" }}>
        <Row gutter={16} justify="center">
          <Col span={24}>
            <Select
              showSearch
              style={{ width: "200px", marginBottom: "20px" }}
              defaultValue="all"
              value={selectedCompany}
              onChange={setSelectedCompany}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              <Option value="all">All Companies</Option>
              {companies.map((companyName) => (
                <Option key={companyName} value={companyName}>
                  {companyName}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Card style={{ marginBottom: "20px" }}>
              {loading ? (
                <Spin size="large" />
              ) : (
                <Statistic
                  title={
                    selectedCompany === "all" ? "Total Companies" : "Company"
                  }
                  value={
                    selectedCompany === "all"
                      ? totals.totalCompanies
                      : selectedCompany
                  }
                  prefix={<BankOutlined />}
                  valueStyle={{ color: "#cf1322" }}
                />
              )}
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              {loading ? (
                <Spin size="large" />
              ) : (
                <Statistic
                  title="Total Files"
                  value={totals.totalFiles}
                  prefix={<FileExcelOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              )}
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              {loading ? (
                <Spin size="large" />
              ) : (
                <Statistic
                  title="Total Structures"
                  value={totals.totalStructures}
                  prefix={<BuildOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              )}
            </Card>
          </Col>
        </Row>
        <FileStatsChart companyName={selectedCompany} />
        {showStructures &&
          (selectedCompany === "all" ? (
            <Collapse items={items} />
          ) : (
            <div className="structureContainer">
              <h2 className="title2">
                <BuildOutlined /> Structures
              </h2>
              {filteredHeaders.map((company, index) => (
                <div key={index.toString()}>
                  <ul className="ulHeaders2">
                    {renderHeaders(
                      company.expectedHeaders,
                      company.companyName
                    )}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        <Button
          type="default"
          onClick={() => setShowStructures(!showStructures)}
          style={{ marginTop: "20px" }}
        >
          {showStructures
            ? "Hide Company Structures"
            : "View Company Structures"}
        </Button>
      </div>
    </div>
  );
};

export default Companies;
