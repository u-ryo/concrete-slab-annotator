package jp.ac.keio.ae.comp.vitz.annotator.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import lombok.Data;
import lombok.experimental.Accessors;

@XmlRootElement(name = "annotation")
@Data
@Accessors(fluent = true)
public class AnnotationXml {
    @XmlElement @JsonProperty
    private String folder;
    @XmlElement @JsonProperty
    private String filename;
    @XmlElement @JsonProperty
    private Size size;
    @XmlElement @JsonProperty
    private List<Obj> object;

    @Data
    @Accessors(fluent = true)
    public static class Size {
        @XmlElement @JsonProperty
        private int width;
        @XmlElement @JsonProperty
        private int height;
        @XmlElement @JsonProperty
        private int depth;
    }

    @Data
    @Accessors(fluent = true)
    public static class Obj {
        @XmlElement @JsonProperty
        private String name;
        @XmlElement @JsonProperty
        private String pose;
        @XmlElement @JsonProperty
        private int truncated;
        @XmlElement @JsonProperty
        private int difficult;
        @XmlElement @JsonProperty
        private Bndbox bndbox;
    }

    @Data
    @Accessors(fluent = true)
    public static class Bndbox {
        @XmlElement @JsonProperty
        private int xmin;
        @XmlElement @JsonProperty
        private int ymin;
        @XmlElement @JsonProperty
        private int xmax;
        @XmlElement @JsonProperty
        private int ymax;
    }
}
