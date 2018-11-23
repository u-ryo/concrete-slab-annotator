package jp.ac.keio.ae.comp.vitz.annotator.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import jp.ac.keio.ae.comp.vitz.annotator.domain.enumeration.Camera;

/**
 * A Image.
 */
@Entity
@Table(name = "image")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Image implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "filename", nullable = false)
    private String filename;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "focal_length")
    private Integer focalLength;

    @Column(name = "distance")
    private Double distance;

    @Enumerated(EnumType.STRING)
    @Column(name = "camera")
    private Camera camera;

    @Column(name = "jhi_role")
    private String role;

    @OneToMany(mappedBy = "image")
    @JsonIgnore
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    private Set<Annotation> annotations = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public Image filename(String filename) {
        this.filename = filename;
        return this;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public Integer getWidth() {
        return width;
    }

    public Image width(Integer width) {
        this.width = width;
        return this;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public Image height(Integer height) {
        this.height = height;
        return this;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Integer getFocalLength() {
        return focalLength;
    }

    public Image focalLength(Integer focalLength) {
        this.focalLength = focalLength;
        return this;
    }

    public void setFocalLength(Integer focalLength) {
        this.focalLength = focalLength;
    }

    public Double getDistance() {
        return distance;
    }

    public Image distance(Double distance) {
        this.distance = distance;
        return this;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public Camera getCamera() {
        return camera;
    }

    public Image camera(Camera camera) {
        this.camera = camera;
        return this;
    }

    public void setCamera(Camera camera) {
        this.camera = camera;
    }

    public String getRole() {
        return role;
    }

    public Image role(String role) {
        this.role = role;
        return this;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Set<Annotation> getAnnotations() {
        return annotations;
    }

    public Image annotations(Set<Annotation> annotations) {
        this.annotations = annotations;
        return this;
    }

    public Image addAnnotations(Annotation annotation) {
        this.annotations.add(annotation);
        annotation.setImage(this);
        return this;
    }

    public Image removeAnnotations(Annotation annotation) {
        this.annotations.remove(annotation);
        annotation.setImage(null);
        return this;
    }

    public void setAnnotations(Set<Annotation> annotations) {
        this.annotations = annotations;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Image image = (Image) o;
        if (image.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), image.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "Image{" +
            "id=" + getId() +
            ", filename='" + getFilename() + "'" +
            ", width=" + getWidth() +
            ", height=" + getHeight() +
            ", focalLength=" + getFocalLength() +
            ", distance=" + getDistance() +
            ", camera='" + getCamera() + "'" +
            ", role='" + getRole() + "'" +
            "}";
    }
}
