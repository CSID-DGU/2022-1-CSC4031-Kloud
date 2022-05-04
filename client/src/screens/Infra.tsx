import styled from "styled-components";
import { useState } from "react";
import { Group } from "@visx/group";
import { hierarchy, Tree } from "@visx/hierarchy";
import { LinearGradient } from "@visx/gradient";
import { pointRadial } from "d3-shape";
import useForceUpdate from "../visualization/useForceUpdate";
import LinkControls from "../visualization/LinkControls";
import getLinkComponent from "../visualization/getLinkComponent";
import { useQuery } from "react-query";
import { INestedInfra, INestedInfraResponse } from "../types";
import { getInfra, getNestedInfra } from "../api";

const defaultMargin = { top: 30, left: 30, right: 30, bottom: 70 };

export type LinkTypesProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const Container = styled.div`
  padding: 20px 30px;
  display: flex;
  width: 100%;
  justify-content: space-around;
`;
const Sidebar = styled.div`
  width: 20%;
  height: 80vh;
  background-color: gainsboro;
  border-radius: 14px;
  margin-top: 37px;
  padding: 25px 5px;
  align-items: center;
  display: flex;
  flex-direction: column;
`;
const SelectedInfra = styled.span`
  font-weight: bold;
  font-size: 20px;
`;
const ChartTmp = styled.div`
  width: 13vw;
  height: 13vw;
  border-radius: 10px;
  margin: 20px 0px;
  background-color: gray;
`;
const SelectedInfraInfo = styled.span`
  margin-bottom: 20px;
`;
const SidebarButton = styled.button<{ buttonType: string }>`
  width: 13vw;
  height: 2.5vw;
  border-radius: 10px;
  border: none;
  margin-bottom: 13px;
  font-size: 15px;
  background-color: ${(props) =>
    props.buttonType === "stop" ? "tomato" : "gray"};
  color: ${(props) => props.theme.bgColor};
  :hover {
    cursor: pointer;
  }
`;
const SidebarButtonBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 130px;
`;

export default function Infra({
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
}: LinkTypesProps) {
  const [layout, setLayout] = useState<string>("cartesian");
  const [orientation, setOrientation] = useState<string>("수평 보기");
  const [linkType, setLinkType] = useState<string>("step");
  const forceUpdate = useForceUpdate();
  const [sidebarItem, setSidebarItem] = useState<string>();
  const [sidebarItemType, setSidebarItemType] = useState<string>();

  const innerWidth = totalWidth - margin.left - margin.right;
  const innerHeight = totalHeight - margin.top - margin.bottom;
  const { isLoading: isNestedInfraLoading, data: nestedInfra } =
    useQuery<INestedInfraResponse>("nestedInfra", getNestedInfra);
  const { isLoading: isInfraLoading, data: allInfra } = useQuery<any>(
    "allInfra",
    getInfra
  );
  const orphan = nestedInfra?.orphan;
  const infra: INestedInfra = nestedInfra?.infra
    ? nestedInfra.infra
    : {
        resource_id: "null",
        resource_type: "null",
      };

  let origin: { x: number; y: number };
  origin = { x: 0, y: 0 };

  const LinkComponent = getLinkComponent({ layout, linkType, orientation });

  return totalWidth < 10 ? null : (
    <Container>
      <div>
        <LinkControls layout={layout} setLayout={setLayout} />
        <svg width="60vw" height="80vh">
          <LinearGradient id="links-gradient" from="#fd9b93" to="#fe6e9e" />
          <rect width="100%" height="80vh" rx={14} fill={"gainsboro"} />
          <Group top={margin.top} left={margin.left}>
            <Tree
              root={hierarchy(infra, (d) => (d.isExpanded ? null : d.children))}
              size={[innerHeight, innerWidth]}
              separation={(a, b) => (a.parent === b.parent ? 1 : 0.5) / a.depth}
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
                          <circle
                            r={22}
                            fill="url('#links-gradient')"
                            onClick={() => {
                              node.data.isExpanded = !node.data.isExpanded;
                              forceUpdate();
                            }}
                          />
                        )}
                        {node.depth !== 0 && (
                          <rect
                            height={height}
                            width={width}
                            y={-height / 2}
                            x={-width / 2}
                            fill="#272b4d"
                            stroke={node.data.children ? "#03c0dc" : "#26deb0"}
                            strokeWidth={1}
                            strokeDasharray={node.data.children ? "0" : "2,2"}
                            strokeOpacity={node.data.children ? 1 : 0.6}
                            rx={node.data.children ? 0 : 10}
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
                          }}
                        >
                          {node.data.resource_type}
                        </text>
                      </Group>
                    );
                  })}
                  {orphan?.map((d, key) => {
                    if (d.resource_type === "network_interface") {
                      var top = 550;
                      var left = 30;
                      return (
                        <Group
                          top={top}
                          left={left + key * 50}
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
                      var top = 550;
                      var left = 30;
                      return (
                        <Group
                          top={top}
                          left={left + key * 50}
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
                            {d.resource_type}
                          </text>
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
        <SelectedInfra>{sidebarItem}</SelectedInfra>
        <ChartTmp></ChartTmp>
        <SelectedInfraInfo>
          Resource Type : <strong>{sidebarItemType}</strong>
        </SelectedInfraInfo>
        {sidebarItemType === "ec2" ? (
          <>
            <SelectedInfraInfo>
              Instance Size :{" "}
              <strong>{allInfra.data[`${sidebarItem}`].InstanceType}</strong>
            </SelectedInfraInfo>
            <SelectedInfraInfo>
              {allInfra.data[`${sidebarItem}`].LaunchTime}
            </SelectedInfraInfo>
            <SidebarButtonBox>
              <SidebarButton buttonType={"stop"}>인스턴스 중지</SidebarButton>
              <SidebarButton buttonType={"start"}>인스턴스 실행</SidebarButton>
            </SidebarButtonBox>
          </>
        ) : null}
        {sidebarItemType === "subnet" ? (
          <>
            <SelectedInfraInfo>
              Region :{" "}
              <strong>
                {allInfra.data[`${sidebarItem}`].AvailabilityZone}
              </strong>
            </SelectedInfraInfo>
            <SelectedInfraInfo>
              VPC Id : <strong>{allInfra.data[`${sidebarItem}`].VpcId}</strong>
            </SelectedInfraInfo>
          </>
        ) : null}
        {sidebarItemType === "rds" ? (
          <>
            <SelectedInfraInfo>
              Region :{" "}
              <strong>
                {allInfra.data[`${sidebarItem}`].AvailabilityZone}
              </strong>
            </SelectedInfraInfo>
            <SelectedInfraInfo>
              DB Size :{" "}
              <strong>{allInfra.data[`${sidebarItem}`].DBInstanceClass}</strong>
            </SelectedInfraInfo>
          </>
        ) : null}
      </Sidebar>
    </Container>
  );
}
