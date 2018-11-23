package jp.ac.keio.ae.comp.vitz.annotator.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";

    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    public static final String ANNOTATOR1 = "ROLE_ANNOTATOR1";
    public static final String ANNOTATOR2 = "ROLE_ANNOTATOR2";
    public static final String ANNOTATOR3 = "ROLE_ANNOTATOR3";

    private AuthoritiesConstants() {
    }
}
