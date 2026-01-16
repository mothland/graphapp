package com.graphapp.service.dto;

import java.util.List;

public class FullGraphDTO {

    public static class GraphDTO {

        public Long id;
        public String name;
        public String description;
    }

    public static class NodeDTO {

        public Long id;
        public String label;
        public Float x;
        public Float y;
    }

    public static class EdgeDTO {

        public Long id;
        public Long source; // node id
        public Long target; // node id
        public Float weight;
        public Boolean directed;
    }

    private GraphDTO graph;
    private List<NodeDTO> nodes;
    private List<EdgeDTO> edges;

    public FullGraphDTO(GraphDTO graph, List<NodeDTO> nodes, List<EdgeDTO> edges) {
        this.graph = graph;
        this.nodes = nodes;
        this.edges = edges;
    }

    public GraphDTO getGraph() {
        return graph;
    }

    public List<NodeDTO> getNodes() {
        return nodes;
    }

    public List<EdgeDTO> getEdges() {
        return edges;
    }
}
