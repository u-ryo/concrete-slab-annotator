package jp.ac.keio.ae.comp.vitz.annotator.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(fluent = true)
@JsonPropertyOrder({"coordinateX", "coordinateY", "xMin", "yMin", "xMax", "yMax", "CRACK", "EFFLORESCENCE", "DONT_CARE", "SPALLING", "POPOUT", "SCALING", "CHALK", "WETTING", "RUST_FLUID", "REINFORCEMENT_EXPOSURE", "HONEY_COMB", "AIR_VOID", "STAIN_DISCOLORATION"})
public class AnnotationCsvBean {
    @JsonProperty
    private Integer coordinateX;
    @JsonProperty
    private Integer coordinateY;
    @JsonProperty
    private int xMin;
    @JsonProperty
    private int yMin;
    @JsonProperty
    private int xMax;
    @JsonProperty
    private int yMax;
    @JsonProperty
    private int crack;
    @JsonProperty
    private int efflorescence;
    @JsonProperty
    private int dontCare;
    @JsonProperty
    private int spalling;
    @JsonProperty
    private int popout;
    @JsonProperty
    private int scaling;
    @JsonProperty
    private int chalk;
    @JsonProperty
    private int wetting;
    @JsonProperty
    private int rustFluid;
    @JsonProperty
    private int reinforcementExposure;
    @JsonProperty
    private int honeyComb;
    @JsonProperty
    private int airVoid;
    @JsonProperty
    private int stainDiscoloration;

    @Override
    public boolean equals(Object obj) {
        return obj != null
            && obj instanceof AnnotationCsvBean
            && ((AnnotationCsvBean) obj).coordinateX == coordinateX
            && ((AnnotationCsvBean) obj).coordinateY == coordinateY;
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = prime + (coordinateX == null ? 0 : coordinateX.hashCode());
        return prime * result
            + (coordinateY == null ? 0 : coordinateY.hashCode());
    }
}
