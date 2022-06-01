import styled from "styled-components";
import { useState } from "react";
import { Group } from "@visx/group";
import { hierarchy, Tree } from "@visx/hierarchy";
import { LinearGradient } from "@visx/gradient";
import useForceUpdate from "../visualization/useForceUpdate";
import getLinkComponent from "../visualization/getLinkComponent";
import { useQuery } from "react-query";
import { INestedInfra, INestedInfraResponse, ICostHistory } from "../types";
import {
  getCostHistoryByResource,
  getInfra,
  getNestedInfra,
  startInstance,
  stopInstance,
} from "../api";
import Modal from "../components/Modal";
import Chart from "../components/Chart";
import ChartModal from "../components/ChartModal";
import Loader from "../components/Loader";
import { ReactComponent as RegionSvg } from "../assets/img/region.svg";
import { ReactComponent as VpcSvg } from "../assets/img/vpc.svg";
import { ReactComponent as SubnetSvg } from "../assets/img/subnet.svg";
import { ReactComponent as InstanceSvg } from "../assets/img/instance.svg";
import { ReactComponent as RdsSvg } from "../assets/img/database.svg";
import { ReactComponent as IgwSvg } from "../assets/img/igw.svg";

const defaultMargin = { top: 30, left: 30, right: 30, bottom: 70 };

export type LinkTypesProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const Container = styled.div`
  padding: 0px 30px;
  display: flex;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 30px;
`;
const InfraHeader = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
`;
const Title = styled.span`
  font-size: 80px;
  color: white;
`;
const InfraSidebarContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
`;

const Sidebar = styled.div`
  width: 20%;
  height: 80vh;
  background-color: gainsboro;
  border-radius: 14px;
  padding: 25px 5px;
  align-items: center;
  display: flex;
  flex-direction: column;
`;
const SelectedInfra = styled.span`
  font-weight: bold;
  font-size: 20px;
`;
const ChartBox = styled.button`
  width: 13vw;
  height: 13vw;
  border-radius: 10px;
  margin: 20px 0px;
  background-color: gray;
  border: none;
  :hover {
    cursor: pointer;
  }
`;
const SelectedInfraInfo = styled.span`
  margin-bottom: 20px;
  font-weight: lighter;
`;
const SidebarButton = styled.button<{ buttonType: string }>`
  width: 13vw;
  height: 2.5vw;
  border-radius: 10px;
  border: none;
  margin-bottom: 13px;
  font-size: 15px;
  background-color: ${(props) =>
    props.buttonType === "stop" ? "tomato" : props.theme.bgColor};
  color: ${(props) =>
    props.buttonType === "stop" ? props.theme.textColor : "white"};
  :hover {
    cursor: pointer;
  }
`;
const SidebarButtonBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 30px;
`;
const InfraInfoBox = styled.div`
  width: auto;
  height: auto;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-right: 20px;
`;
const InfraInfo = styled.span`
  font-size: 22px;
  color: white;
  font-weight: lighter;
  margin-bottom: 5px;
`;
export default function Infra({
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
}: LinkTypesProps) {
  const forceUpdate = useForceUpdate();
  const [sidebarItem, setSidebarItem] = useState<string>();
  const [sidebarItemType, setSidebarItemType] = useState<string>();
  const [selectedInstanceCost, setSelectedInstanceCost] = useState<number>();
  const [openModal, setOpenModal] = useState<boolean>(false);

  const innerWidth = totalWidth - margin.left - margin.right;
  const innerHeight = totalHeight - margin.top - margin.bottom;
  const { isLoading: isNestedInfraLoading, data: nestedInfra } =
    useQuery<INestedInfraResponse>("nestedInfra", getNestedInfra);
  const { isLoading: isInfraLoading, data: allInfra } = useQuery<any>(
    "allInfra",
    getInfra
  );
  const {
    isLoading: isCostHistoryByResourceLoading,
    data: costHistoryByResource,
  } = useQuery<ICostHistory>("costHistoryByResource", getCostHistoryByResource);

  const orphan = nestedInfra?.orphan;
  const infra: INestedInfra = nestedInfra?.infra
    ? nestedInfra.infra
    : {
        resource_id: "null",
        resource_type: "null",
      };

  let origin: { x: number; y: number };
  origin = { x: 0, y: 0 };

  const LinkComponent = getLinkComponent({
    layout: "cartesian",
    linkType: "step",
    orientation: "수평 보기",
  });

  return totalWidth < 10 ? null : isInfraLoading ||
    isNestedInfraLoading ||
    isCostHistoryByResourceLoading ? (
    <Loader />
  ) : (
    <>
      <InfraHeader>
        <Title>Infra Visualization</Title>
        <InfraInfoBox>
          <InfraInfo>클라우드 인프라 시각화 페이지입니다.</InfraInfo>
          <InfraInfo>마우스를 올려 인프라 세부 정보를 확인합니다.</InfraInfo>
        </InfraInfoBox>
      </InfraHeader>
      <Container>
        <InfraSidebarContainer>
          <div>
            <svg width="60vw" height="80vh">
              <LinearGradient id="links-gradient" from="#fd9b93" to="#fe6e9e" />
              <rect width="100%" height="80vh" rx={14} fill={"gainsboro"} />
              {/* 전체 배경 */}
              <Group top={margin.top} left={margin.left}>
                <Tree
                  root={hierarchy(infra, (d) =>
                    d.isExpanded ? null : d.children
                  )}
                  size={[innerHeight, innerWidth]}
                  separation={(a, b) =>
                    (a.parent === b.parent ? 1 : 0.5) / a.depth
                  }
                >
                  {(tree) => (
                    <Group top={origin.y} left={origin.x}>
                      {tree.links().map((link, i) => (
                        <LinkComponent
                          key={i}
                          data={link}
                          stroke={"#040959"}
                          strokeWidth="1"
                          fill="none"
                          // 연결선
                        />
                      ))}

                      {tree.descendants().map((node, key) => {
                        const width = 40;
                        const height = 20;
                        let top: number;
                        let left: number;

                        top = node.x;
                        left = node.y;

                        return (
                          <Group top={top} left={left} key={key}>
                            {node.depth === 0 && (
                              <>
                                {/* 트리 시작점 */}
                                <circle
                                  r={25}
                                  fill="url('#links-gradient')"
                                  onClick={() => {
                                    node.data.isExpanded =
                                      !node.data.isExpanded;
                                    forceUpdate();
                                  }}
                                />
                                <RegionSvg />
                              </>
                            )}
                            {node.depth !== 0 && (
                              <rect
                                height={height}
                                width={width}
                                y={-height / 2}
                                x={-width / 2}
                                fill={
                                  node.data.resource_type === "ec2"
                                    ? node.data.state === "running"
                                      ? "green"
                                      : "tomato"
                                    : "#272b4d"
                                }
                                stroke={
                                  node.data.children ? "#03c0dc" : "#26deb0"
                                }
                                strokeWidth={1}
                                strokeDasharray={
                                  node.data.children ? "0" : "2,2"
                                }
                                strokeOpacity={node.data.children ? 1 : 0.6}
                                rx={node.data.children ? 0 : 10}
                                // 마지막 노드
                                onClick={() => {
                                  node.data.isExpanded = !node.data.isExpanded;
                                  forceUpdate();
                                }}
                              />
                            )}
                            <text
                              dy=".33em"
                              fontSize={10}
                              fontFamily="Arial"
                              textAnchor="middle"
                              style={{ cursor: "default" }}
                              fill={
                                node.depth === 0
                                  ? "#71248e"
                                  : node.children
                                  ? "white"
                                  : "#26deb0"
                              }
                              onMouseOver={(e) => {
                                const {
                                  data: { resource_id, resource_type },
                                } = node;
                                setSidebarItem(resource_id);
                                setSidebarItemType(resource_type);
                                const costs = costHistoryByResource?.data.map(
                                  (d) => {
                                    const hit = d.Groups.filter(
                                      (g) => g.Keys[0] === resource_id
                                    );
                                    return hit.length === 0
                                      ? 0
                                      : hit[0].Metrics.UnblendedCost.Amount;
                                  }
                                );
                                let sum = 0;
                                costs?.forEach((n) => {
                                  sum += Number(n);
                                });
                                setSelectedInstanceCost(Number(sum.toFixed(2)));
                              }}
                            >
                              {node.data.resource_type}
                            </text>
                            {node.data.resource_type === "ec2" ? (
                              <InstanceSvg />
                            ) : node.data.resource_type === "subnet" ? (
                              <SubnetSvg />
                            ) : node.data.resource_type === "vpc" ? (
                              <VpcSvg />
                            ) : null}
                          </Group>
                        );
                      })}
                      {orphan?.map((d, key) => {
                        var orphan_top = 500;
                        var orphan_left = 30;
                        if (d.resource_type === "network_interface") {
                          return (
                            <Group
                              top={orphan_top}
                              left={orphan_left + key * 50}
                              key={d.resource_id}
                            >
                              <rect
                                height={25}
                                width={45}
                                y={-40 / 2}
                                x={-40 / 2}
                                fill="#272b4d"
                                stroke="#26deb0"
                                strokeWidth={1}
                                strokeOpacity="1"
                              />
                              <text
                                dy="-.33em"
                                dx=".3em"
                                fontSize={10}
                                fontFamily="Arial"
                                textAnchor="middle"
                                style={{ cursor: "default" }}
                                fill="white"
                                onMouseOver={(e) => {
                                  const { resource_id, resource_type } = d;
                                  setSidebarItem(resource_id);
                                  setSidebarItemType(resource_type);
                                }}
                              >
                                NI
                              </text>
                            </Group>
                          );
                        } else {
                          return (
                            <Group
                              top={orphan_top}
                              left={orphan_left + key * 50}
                              key={d.resource_id}
                            >
                              <rect
                                height={25}
                                width={45}
                                y={-40 / 2}
                                x={-40 / 2}
                                fill="#272b4d"
                                stroke="#26deb0"
                                strokeWidth={1}
                                strokeOpacity="1"
                              />
                              <text
                                dy="-.33em"
                                dx=".3em"
                                fontSize={10}
                                fontFamily="Arial"
                                textAnchor="middle"
                                style={{ cursor: "default" }}
                                fill="white"
                                onMouseOver={(e) => {
                                  const { resource_id, resource_type } = d;
                                  setSidebarItem(resource_id);
                                  setSidebarItemType(resource_type);
                                  costHistoryByResource?.data.map((d) => {
                                    const hit = d.Groups.filter(
                                      (g) => g.Keys[0] === resource_id
                                    );
                                    console.log(hit);
                                    return hit.length === 0
                                      ? 0
                                      : hit[0].Metrics.UnblendedCost.Amount;
                                  });
                                }}
                              >
                                {d.resource_type}
                              </text>
                              {d.resource_type === "rds" ? (
                                <RdsSvg />
                              ) : d.resource_type === "igw" ? (
                                <IgwSvg />
                              ) : null}
                            </Group>
                          );
                        }
                      })}
                    </Group>
                  )}
                </Tree>
              </Group>
            </svg>
          </div>
          <Sidebar>
            {sidebarItem ? (
              <>
                {sidebarItemType === "subnet" ? (
                  <SelectedInfra>Subnet</SelectedInfra>
                ) : sidebarItemType === "vpc" ? (
                  <SelectedInfra>VPC</SelectedInfra>
                ) : (
                  <SelectedInfra>{sidebarItem}</SelectedInfra>
                )}
                <ChartBox onClick={() => setOpenModal((prev) => !prev)}>
                  {costHistoryByResource ? (
                    <Chart
                      resourceId={sidebarItem}
                      costHistory={costHistoryByResource}
                    />
                  ) : null}
                </ChartBox>
                {sidebarItemType === "network_interface" ? (
                  <SelectedInfraInfo>
                    Type : <strong>{sidebarItemType}</strong>
                  </SelectedInfraInfo>
                ) : sidebarItemType !== "ec2" ? (
                  <SelectedInfraInfo>
                    Resource Type : <strong>{sidebarItemType}</strong>
                  </SelectedInfraInfo>
                ) : (
                  <></>
                )}

                {sidebarItemType === "ec2" ? (
                  <>
                    <SelectedInfraInfo>
                      <strong>최근 2주간 비용 {selectedInstanceCost}$</strong>
                    </SelectedInfraInfo>
                    <SelectedInfraInfo>
                      Instance Size :{" "}
                      <strong>
                        {allInfra.data[`${sidebarItem}`].InstanceType}
                      </strong>
                    </SelectedInfraInfo>
                    <SelectedInfraInfo>
                      State :{" "}
                      <strong>
                        {allInfra.data[`${sidebarItem}`].State.Name}
                      </strong>
                    </SelectedInfraInfo>
                    <SelectedInfraInfo>
                      {allInfra.data[`${sidebarItem}`].LaunchTime}
                    </SelectedInfraInfo>
                    <SidebarButtonBox>
                      <SidebarButton
                        buttonType={"start"}
                        onClick={() => startInstance(sidebarItem)}
                      >
                        인스턴스 실행
                      </SidebarButton>
                      <SidebarButton
                        buttonType={"stop"}
                        onClick={() => stopInstance(sidebarItem)}
                      >
                        인스턴스 중지
                      </SidebarButton>
                    </SidebarButtonBox>
                  </>
                ) : sidebarItemType === "subnet" ? (
                  <>
                    <SelectedInfraInfo>
                      Region :{" "}
                      <strong>
                        {allInfra.data[`${sidebarItem}`].AvailabilityZone}
                      </strong>
                    </SelectedInfraInfo>
                    <SelectedInfraInfo>
                      Subnet : <strong>{sidebarItem?.split("-")[1]}</strong>
                    </SelectedInfraInfo>
                    <SelectedInfraInfo>
                      VPC :{" "}
                      <strong>
                        {allInfra.data[`${sidebarItem}`].VpcId.split("-")[1]}
                      </strong>
                    </SelectedInfraInfo>
                  </>
                ) : sidebarItemType === "rds" ? (
                  <>
                    <SelectedInfraInfo>
                      Region :{" "}
                      <strong>
                        {allInfra.data[`${sidebarItem}`].AvailabilityZone}
                      </strong>
                    </SelectedInfraInfo>
                    <SelectedInfraInfo>
                      DB Size :{" "}
                      <strong>
                        {allInfra.data[`${sidebarItem}`].DBInstanceClass}
                      </strong>
                    </SelectedInfraInfo>
                  </>
                ) : sidebarItemType === "network_interface" ? (
                  <>
                    <SelectedInfraInfo>
                      Group :{" "}
                      <strong>{allInfra.data[`${sidebarItem}`].VpcId}</strong>
                    </SelectedInfraInfo>
                  </>
                ) : sidebarItemType === "igw" ? (
                  <>
                    <SelectedInfraInfo>
                      Group :{" "}
                      <strong>
                        {allInfra.data[`${sidebarItem}`].Attachments[0].VpcId}
                      </strong>
                    </SelectedInfraInfo>
                  </>
                ) : sidebarItemType === "vpc" ? (
                  <>
                    <SelectedInfraInfo>
                      VPC Id : <strong>{sidebarItem?.split("-")[1]}</strong>
                    </SelectedInfraInfo>
                  </>
                ) : null}
              </>
            ) : null}
          </Sidebar>
          {costHistoryByResource ? (
            openModal ? (
              sidebarItemType === "ec2" ? (
                <Modal
                  content={
                    <ChartModal
                      instanceType={
                        allInfra.data[`${sidebarItem}`].InstanceType
                      }
                      resourceId={`${sidebarItem}`}
                      costHistory={costHistoryByResource}
                    />
                  }
                  handleModal={() => setOpenModal(false)}
                />
              ) : (
                <Modal
                  content={
                    <ChartModal
                      resourceId={`${sidebarItem}`}
                      costHistory={costHistoryByResource}
                    />
                  }
                  handleModal={() => setOpenModal(false)}
                />
              )
            ) : null
          ) : null}
        </InfraSidebarContainer>
      </Container>
    </>
  );
}
