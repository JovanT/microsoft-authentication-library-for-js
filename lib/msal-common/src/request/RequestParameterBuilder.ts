/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AADServerParamKeys, Constants, ResponseMode, SSOTypes, ClientInfo, ClaimsRequestKeys } from "../utils/Constants";
import { ScopeSet } from "./ScopeSet";
import { ClientConfigurationError } from "../error/ClientConfigurationError";
import { StringDict } from "../utils/MsalTypes";
import { RequestValidator } from "./RequestValidator";
import { LibraryInfo } from "../config/ClientConfiguration";
import { StringUtils } from "../utils/StringUtils";

export class RequestParameterBuilder {

    private parameters: Map<string, string>;

    constructor() {
        this.parameters = new Map<string, string>();
    }

    /**
     * add response_type = code
     */
    addResponseTypeCode(): void {
        this.parameters.set(
            AADServerParamKeys.RESPONSE_TYPE, encodeURIComponent(Constants.CODE_RESPONSE_TYPE)
        );
    }

    /**
     * add response_mode. defaults to query.
     * @param responseMode
     */
    addResponseMode(responseMode?: ResponseMode): void {
        this.parameters.set(
            AADServerParamKeys.RESPONSE_MODE,
            encodeURIComponent((responseMode) ? responseMode : ResponseMode.QUERY)
        );
    }

    /**
     * add scopes
     * @param scopeSet
     */
    addScopes(scopeSet: ScopeSet): void {
        this.parameters.set(AADServerParamKeys.SCOPE, encodeURIComponent(scopeSet.printScopes()));
    }

    /**
     * add clientId
     * @param clientId
     */
    addClientId(clientId: string): void {
        this.parameters.set(AADServerParamKeys.CLIENT_ID, encodeURIComponent(clientId));
    }

    /**
     * add redirect_uri
     * @param redirectUri
     */
    addRedirectUri(redirectUri: string): void {
        RequestValidator.validateRedirectUri(redirectUri);
        this.parameters.set(AADServerParamKeys.REDIRECT_URI, encodeURIComponent(redirectUri));
    }

    /**
     * add domain_hint
     * @param domainHint
     */
    addDomainHint(domainHint: string): void {
        this.parameters.set(SSOTypes.DOMAIN_HINT, encodeURIComponent(domainHint));
    }

    /**
     * add login_hint
     * @param loginHint
     */
    addLoginHint(loginHint: string): void {
        this.parameters.set(SSOTypes.LOGIN_HINT, encodeURIComponent(loginHint));
    }

    /**
     * add sid
     * @param sid 
     */
    addSid(sid: string): void {
        this.parameters.set(SSOTypes.SID, encodeURIComponent(sid));
    }

    /**
     * add claims
     * @param claims
     */
    addClaims(claims: string, clientCapabilities: Array<string>): void {
        const mergedClaims = this.addClientCapabilitiesToClaims(claims, clientCapabilities);
        RequestValidator.validateClaims(mergedClaims);
        this.parameters.set(AADServerParamKeys.CLAIMS, encodeURIComponent(mergedClaims));
    }

    /**
     * add correlationId
     * @param correlationId
     */
    addCorrelationId(correlationId: string): void {
        this.parameters.set(AADServerParamKeys.CLIENT_REQUEST_ID, encodeURIComponent(correlationId));
    }

    /**
     * add library info query params
     * @param libraryInfo
     */
    addLibraryInfo(libraryInfo: LibraryInfo): void {
        // Telemetry Info
        this.parameters.set(AADServerParamKeys.X_CLIENT_SKU, libraryInfo.sku);
        this.parameters.set(AADServerParamKeys.X_CLIENT_VER, libraryInfo.version);
        this.parameters.set(AADServerParamKeys.X_CLIENT_OS, libraryInfo.os);
        this.parameters.set(AADServerParamKeys.X_CLIENT_CPU, libraryInfo.cpu);
    }

    /**
     * add prompt
     * @param prompt
     */
    addPrompt(prompt: string): void {
        RequestValidator.validatePrompt(prompt);
        this.parameters.set(`${AADServerParamKeys.PROMPT}`, encodeURIComponent(prompt));
    }

    /**
     * add state
     * @param state
     */
    addState(state: string): void {
        if (!StringUtils.isEmpty(state)) {
            this.parameters.set(AADServerParamKeys.STATE, encodeURIComponent(state));
        }
    }

    /**
     * add nonce
     * @param nonce
     */
    addNonce(nonce: string): void {
        this.parameters.set(AADServerParamKeys.NONCE, encodeURIComponent(nonce));
    }

    /**
     * add code_challenge and code_challenge_method
     * - throw if either of them are not passed
     * @param codeChallenge
     * @param codeChallengeMethod
     */
    addCodeChallengeParams(
        codeChallenge: string,
        codeChallengeMethod: string
    ): void {
        RequestValidator.validateCodeChallengeParams(codeChallenge, codeChallengeMethod);
        if (codeChallenge && codeChallengeMethod) {
            this.parameters.set(AADServerParamKeys.CODE_CHALLENGE, encodeURIComponent(codeChallenge));
            this.parameters.set(AADServerParamKeys.CODE_CHALLENGE_METHOD, encodeURIComponent(codeChallengeMethod));
        } else {
            throw ClientConfigurationError.createInvalidCodeChallengeParamsError();
        }
    }

    /**
     * add the `authorization_code` passed by the user to exchange for a token
     * @param code
     */
    addAuthorizationCode(code: string): void {
        this.parameters.set(AADServerParamKeys.CODE, encodeURIComponent(code));
    }

    /**
     * add the `authorization_code` passed by the user to exchange for a token
     * @param code
     */
    addDeviceCode(code: string): void {
        this.parameters.set(AADServerParamKeys.DEVICE_CODE, encodeURIComponent(code));
    }

    /**
     * add the `refreshToken` passed by the user
     * @param refreshToken
     */
    addRefreshToken(refreshToken: string): void {
        this.parameters.set(AADServerParamKeys.REFRESH_TOKEN, encodeURIComponent(refreshToken));
    }

    /**
     * add the `code_verifier` passed by the user to exchange for a token
     * @param codeVerifier
     */
    addCodeVerifier(codeVerifier: string): void {
        this.parameters.set(AADServerParamKeys.CODE_VERIFIER, encodeURIComponent(codeVerifier));
    }

    /**
     * add client_secret
     * @param clientSecret
     */
    addClientSecret(clientSecret: string): void {
        this.parameters.set(AADServerParamKeys.CLIENT_SECRET, encodeURIComponent(clientSecret));
    }

    /**
     * add clientAssertion for confidential client flows
     * @param clientAssertion
     */
    addClientAssertion(clientAssertion: string): void {
        this.parameters.set(AADServerParamKeys.CLIENT_ASSERTION, encodeURIComponent(clientAssertion));
    }

    /**
     * add clientAssertionType for confidential client flows
     * @param clientAssertionType
     */
    addClientAssertionType(clientAssertionType: string): void {
        this.parameters.set(AADServerParamKeys.CLIENT_ASSERTION_TYPE, encodeURIComponent(clientAssertionType));
    }
    
    /**
     * add OBO assertion for confidential client flows
     * @param clientAssertion
     */
    addOboAssertion(oboAssertion: string): void {
        this.parameters.set(AADServerParamKeys.OBO_ASSERTION, encodeURIComponent(oboAssertion));
    }
    
    /**
     * add grant type
     * @param grantType
     */
    addRequestTokenUse(tokenUse: string): void {
        this.parameters.set(AADServerParamKeys.REQUESTED_TOKEN_USE, encodeURIComponent(tokenUse));
    }

    /**
     * add grant type
     * @param grantType
     */
    addGrantType(grantType: string): void {
        this.parameters.set(AADServerParamKeys.GRANT_TYPE, encodeURIComponent(grantType));
    }

    /**
     * add client info
     *
     */
    addClientInfo(): void {
        this.parameters.set(ClientInfo, "1");
    }

    /**
     * add extraQueryParams
     * @param eQparams
     */
    addExtraQueryParameters(eQparams: StringDict): void {
        RequestValidator.sanitizeEQParams(eQparams, this.parameters);
        Object.keys(eQparams).forEach((key) => {
            this.parameters.set(key, eQparams[key]);
        });
    }

    addClientCapabilitiesToClaims(claims: string, clientCapabilities: Array<string>): string {
        let mergedClaims: object;

        // Parse provided claims into JSON object or initialize empty object
        if (StringUtils.isEmpty(claims)) {
            mergedClaims = {};
        } else {
            try {
                mergedClaims = JSON.parse(claims);
            } catch(e) {
                throw ClientConfigurationError.createInvalidClaimsRequestError();
            }
        }

        if (clientCapabilities && clientCapabilities.length > 0) {
            if (!mergedClaims.hasOwnProperty(ClaimsRequestKeys.ACCESS_TOKEN)){
                // Add access_token key to claims object
                mergedClaims[ClaimsRequestKeys.ACCESS_TOKEN] = {};
            }

            // Add xms_cc claim with provided clientCapabilities to access_token key
            mergedClaims[ClaimsRequestKeys.ACCESS_TOKEN][ClaimsRequestKeys.XMS_CC] = {
                values: clientCapabilities
            };
        }

        return JSON.stringify(mergedClaims);
    }

    /**
     * Utility to create a URL from the params map
     */
    createQueryString(): string {
        const queryParameterArray: Array<string> = new Array<string>();

        this.parameters.forEach((value, key) => {
            queryParameterArray.push(`${key}=${value}`);
        });

        return queryParameterArray.join("&");
    }
}
