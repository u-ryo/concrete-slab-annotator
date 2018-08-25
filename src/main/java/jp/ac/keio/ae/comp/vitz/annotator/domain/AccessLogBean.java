package jp.ac.keio.ae.comp.vitz.annotator.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.time.ZonedDateTime;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(fluent = true)
@JsonPropertyOrder({"login", "filename", "defect", "squareSize", "from", "to"})
public class AccessLogBean {
    @JsonProperty
    private String login;
    @JsonProperty
    private String filename;
    @JsonProperty
    private String defect;
    @JsonProperty
    private int squareSize;
    @JsonProperty
    private String from;
    @JsonProperty
    private String to;
}
