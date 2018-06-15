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
    @JsonProperty("login")
    private String login;
    @JsonProperty("filename")
    private String filename;
    @JsonProperty("defect")
    private String defect;
    @JsonProperty("squareSize")
    private int squareSize;
    @JsonProperty("from")
    private String from;
    @JsonProperty("to")
    private String to;
}
