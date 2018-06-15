package jp.ac.keio.ae.comp.vitz.annotator.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.Objects;

/**
 * A AccessLog.
 */
@Entity
@Table(name = "access_log")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class AccessLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "jhi_from", nullable = false)
    private ZonedDateTime from;

    @NotNull
    @Column(name = "jhi_to", nullable = false)
    private ZonedDateTime to;

    @ManyToOne(optional = false)
    @NotNull
    private User user;

    @ManyToOne(optional = false)
    @NotNull
    private Annotation annotation;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ZonedDateTime getFrom() {
        return from;
    }

    public AccessLog from(ZonedDateTime from) {
        this.from = from;
        return this;
    }

    public void setFrom(ZonedDateTime from) {
        this.from = from;
    }

    public ZonedDateTime getTo() {
        return to;
    }

    public AccessLog to(ZonedDateTime to) {
        this.to = to;
        return this;
    }

    public void setTo(ZonedDateTime to) {
        this.to = to;
    }

    public User getUser() {
        return user;
    }

    public AccessLog user(User user) {
        this.user = user;
        return this;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Annotation getAnnotation() {
        return annotation;
    }

    public AccessLog annotation(Annotation annotation) {
        this.annotation = annotation;
        return this;
    }

    public void setAnnotation(Annotation annotation) {
        this.annotation = annotation;
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
        AccessLog accessLog = (AccessLog) o;
        if (accessLog.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), accessLog.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "AccessLog{" +
            "id=" + getId() +
            ", from='" + getFrom() + "'" +
            ", to='" + getTo() + "'" +
            "}";
    }
}
