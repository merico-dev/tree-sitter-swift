// Swift Lexical Structure
// https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html

const PREC = {
    COMMENT: 5,
    OPTIONAL_TYPE: 10,
    METATYPE_TYPE: 10,
    PROTOCOL_COMPOSITION_TYPE: 10,

    ASSIGN: 0,
    TYPE_CASTING: 1,
    OPERATOR: 2,
    INLINE_IF: 3,
};

module.exports = grammar({
    name: "swift",

    conflicts: $ => [
        [$.switch_case],
        [$.tuple_expression, $.tuple_type],
        [$._type, $.function_type_argument],
        [$.trailing_closures],
        [$.function_type],
        [$.expression],
        [$.wildcard_pattern, $.wildcard_expression],
        [$._self_expression, $.self_method_expression, $.self_initializer_expression],
        [$._pattern],
        [$.identifier_pattern, $.variable_declaration],
        [$.union_style_enum_member, $.raw_value_style_enum_member],
        [$.union_style_enum_case, $.raw_value_style_enum_case],
        [$._self_expression, $.self_subscript_expression],
        [$.function_call_expression],
        [$.array_literal, $.capture_list_item],
        [$.class_declaration, $._declaration_modifier],
        [$.getter_setter_block, $.subscript_declaration],
        [$.variable_declaration, $.getter_setter_block],
        [$.value_binding_pattern, $.as_pattern],
        [$.identifier_pattern, $.tuple_pattern_element],
        [$.tuple_type_element, $.function_type_argument],
        [$._primary_expression, $.closure_parameter],
        [$.explicit_member_expression],
        [$.initializer_expression],
        [$.type_identifier],
        [$._primary_expression, $.type_identifier],
        [$._type, $.tuple_type_element, $.function_type_argument],
        [$._primary_expression, $.identifier_pattern],
        [$._primary_expression, $.identifier_pattern, $.variable_declaration],
        [$.tuple_expression, $.tuple_pattern],
        [$.tuple_element, $.identifier_pattern, $.tuple_pattern_element],
        [$.tuple_element, $._pattern],
        [$.parenthesized_expression, $._pattern],
        [$.implicit_member_expression, $.enum_case_pattern],
        [$.expression, $.function_call_expression],
        [$.binary_expression, $._postfix_expression],
        [$.expression, $._postfix_expression],
        [$.binary_expression, $._pattern],
        [$.binary_expression],
        [$.parenthesized_expression, $.tuple_element],
        [$.parenthesized_expression, $.tuple_element, $._pattern],
        [$.optional_binding_condition],
        [$._type_casting_expression, $._pattern],
        [$._pattern, $._assignment_expression],
    ],

    word: $ => $.identifier,

    extras: $ => [/\s+/, $.comment],

    rules: {
        program: $ => $._statements,

        //
        // Statements
        //
        _statements: $ => repeat1(seq($._statement, choice(";", /\n/))),

        _statement: $ =>
            choice(
                $.expression,
                $._declaration,
                $._loop_statement,
                $._branch_statement,
                $.labeled_statement,
                $._control_transfer_statement,
                $.defer_statement,
                $.do_statement,
                $._compiler_control_statement
            ),

        _loop_statement: $ =>
            choice(
                $.for_in_statement,
                $.while_statement,
                $.repeat_while_statement
            ),

        for_in_statement: $ =>
            seq(
                "for",
                optional("case"),
                field("variable", $._pattern),
                "in",
                field("collection", $.expression),
                optional($.where_clause),
                $._code_block
            ),

        while_statement: $ =>
            seq(
                "while",
                commaSep1($._condition),
                $._code_block
            ),

        _condition: $ =>
            choice(
                field("expression_condition", $.expression),
                field("availability_condition", $.availability_condition),
                field("case_condition", $.case_condition),
                field("optional_binding_condition", $.optional_binding_condition)
            ),

        case_condition: $ => seq("case", $._pattern, $.initializer),

        optional_binding_condition: $ =>
            seq(
                choice("let", "var"),
                commaSep1(seq($._pattern, $.initializer))
            ),

        repeat_while_statement: $ =>
            seq("repeat", $._code_block, "while", field("expression_condition", $.expression)),

        _branch_statement: $ =>
            choice($.if_statement, $.guard_statement, $.switch_statement),

        if_statement: $ =>
            seq("if", commaSep1($._condition), $._code_block, field("else_clause", optional($.else_clause))),

        else_clause: $ =>
            choice(
                seq("else", $._code_block),
                seq("else", field("if_statement", $.if_statement))
            ),

        guard_statement: $ =>
            seq("guard", commaSep1($._condition), "else", $._code_block),

        switch_statement: $ =>
            seq(
                "switch",
                field("subject", $.expression),
                "{",
                repeat(field("cases", $.switch_case)),
                "}"
            ),

        switch_case: $ =>
            choice(
                seq(field("case", $.case_label), $._statements),
                seq(field("default", $.default_label), $._statements),
                $.conditional_switch_case
            ),

        case_label: $ =>
            seq(repeat($.attribute), "case", commaSep1(field("items", $.case_item)), ":"),

        case_item: $ => seq($._pattern, optional($.where_clause)),

        default_label: $ => seq(repeat($.attribute), "default", ":"),

        where_clause: $ => seq("where", $._where_expression),

        _where_expression: $ => $.expression,

        conditional_switch_case: $ =>
            seq(
                $.switch_if_directive_clause,
                repeat($.elseif_directive_clause),
                optional($.switch_else_directive_clause),
                "#endif"
            ),

        switch_if_directive_clause: $ =>
            seq(
                "#if",
                $.compilation_condition,
                repeat($.switch_case)
            ),

        switch_elseif_directive_clause: $ =>
            seq(
                "#elseif",
                $.compilation_condition,
                repeat($.switch_case)
            ),

        switch_else_directive_clause: $ =>
            seq("#else", repeat($.switch_case)),

        labeled_statement: $ =>
            seq(
                $._label_name,
                ":",
                field("statement",
                    choice($._loop_statement,
                        $.if_statement,
                        $.switch_statement,
                        $.do_statement
                    )
                )
            ),

        _label_name: $ => $.identifier,

        _control_transfer_statement: $ =>
            choice(
                $.break_statement,
                $.continue_statement,
                $.fallthrough_statement,
                $.return_statement,
                $.throw_statement
            ),

        break_statement: $ => seq("break", optional($._label_name)),

        continue_statement: $ => seq("continue", optional($._label_name)),

        fallthrough_statement: $ => "fallthrough",

        return_statement: $ => seq("return", optional($.expression)),

        throw_statement: $ => seq("throw", field("expression", $.expression)),

        defer_statement: $ => seq("defer", field("block", $._code_block)),

        do_statement: $ => seq("do", $._code_block, repeat(field("catch_clauses", $.catch_clause))),

        catch_clause: $ =>
            seq("catch", optional(commaSep($.catch_pattern)), $._code_block),

        catch_pattern: $ => seq($._pattern, optional($.where_clause)),

        _compiler_control_statement: $ =>
            choice(
                $.conditional_compilation_block,
                $.line_control_statement,
                $.diagnostic_statement
            ),

        conditional_compilation_block: $ =>
            seq(
                "#if",
                field("condition", $.compilation_condition),
                field("success", optional($._statements)),
                repeat(field("alternatives", $.elseif_directive_clause)),
                field("failure", optional($.else_directive_clause)),
                "#endif"
            ),

        elseif_directive_clause: $ =>
            seq(
                "#elseif",
                field("condition", $.compilation_condition),
                field("statements", optional($._statements))
            ),

        else_directive_clause: $ =>
            seq("#else", field("statements", optional($._statements))),

        compilation_condition: $ =>
            prec.left(choice(
                $._platform_condition,
                $.identifier,
                $.boolean_literal,
                seq("(", $.compilation_condition, ")"),
                seq("!", $.compilation_condition),
                seq($.compilation_condition, "&&", $.compilation_condition),
                seq($.compilation_condition, "||", $.compilation_condition)
            )),

        _platform_condition: $ =>
            choice(
                seq("os", "(", $._operating_system, ")"),
                seq("arch", "(", $._architecture, ")"),
                seq("swift", "(", ">=", $._swift_version, ")"),
                seq("swift", "(", "<", $._swift_version, ")"),
                seq("compiler", "(", ">=", $._swift_version, ")"),
                seq("compiler", "(", "<", $._swift_version, ")"),
                seq("canImport", "(", alias($.identifier, $.module_name), ")"),
                seq("targetEnvironment", "(", $._environment, ")")
            ),

        _operating_system: $ => choice("macOS", "iOS", "watchOS", "tvOS", "Linux", "FreeBSD", "Windows", "Cygwin", "Android"),

        _architecture: $ => choice("i386", "x86_64", "arm", "arm64", "wasm32", "s390x", "powerpc64", "powerpc64le"),

        _swift_version: $ =>
            seq($.number, optional($._swift_version_continuation)),

        _swift_version_continuation: $ =>
            seq(".", $.number, optional($._swift_version_continuation)),

        _environment: $ => choice("simulator", "macCatalyst"),

        line_control_statement: $ =>
            choice(
                seq(
                    "#sourceLocation",
                    "(",
                    "file:",
                    $._literal,
                    ",",
                    "line:",
                    alias($.number, $.line_number),
                    ")"
                ),
                seq("#sourceLocation", "(", ")")
            ),

        diagnostic_statement: $ =>
            choice(
                seq("#error", "(", $._literal, ")"),
                seq("#warning", "(", $._literal, ")")
            ),

        availability_condition: $ =>
            seq("#available", "(", commaSep1($.availability_argument), ")"),

        availability_argument: $ =>
            choice(seq($._platform_name, alias($.availability_number, $.platform_version)), "*"),

        availability_number: $ => seq($.number, optional(seq(".", $.number))),

        _platform_name: $ =>
            choice(
                "iOS",
                "iOSApplicationExtension",
                "macOS",
                "macOSApplicationExtension",
                "macCatalyst",
                "macCatalystApplicationExtension",
                "watchOS",
                "tvOS"
            ),

        //
        // Expression
        //
        expression: $ =>
            seq(
                optional($._try_operator),
                optional("await"),
                choice(
                    seq(
                        optional(alias($.operator, $.prefix_operator)),
                        field("postfix_expression", $._postfix_expression)
                    ),
                    field("in_out_expression", $.in_out_expression),
                    field("binary_expression", $.binary_expression)
                ),
            ),

        in_out_expression: $ => seq("&", field("identifier", $.identifier)),

        _try_operator: $ => choice("try", seq("try", "?"), seq("try", "!")),

        binary_expression: $ =>
            choice(
                $._assignment_expression,
                $._binary_expression,
                $._inline_if_expression,
                $._type_casting_expression
            ),

        _assignment_expression: $ =>
            prec.right(PREC.ASSIGN, seq(
                field("left", $.expression),
                "=",
                optional($._try_operator),
                optional("await"),
                field("right", $.expression)
            )),

        _binary_expression: $ =>
            prec.left(PREC.OPERATOR, seq(
                field("left", $.expression),
                alias($.operator, $.binary_operator),
                field("right", $.expression)
            )),

        _inline_if_expression: $ =>
            prec.right(PREC.INLINE_IF, seq(
                field("left", $.expression),
                "?",
                $.expression,
                ":",
                optional($._try_operator),
                optional("await"),
                $.expression
            )),

        _type_casting_expression: $ =>
            prec.left(PREC.TYPE_CASTING, seq(
                field("left", $.expression),
                field("type_cast", $.type_casting_operator)
            )),

        type_casting_operator: $ =>
            choice(
                seq("is", $._type),
                seq("as", $._type),
                seq("as", "?", $._type),
                seq("as", "!", $._type)
            ),

        _primary_expression: $ =>
            choice(
                $.identifier,
                $._literal_expression,
                $._self_expression,
                $._superclass_expression,
                $.closure_expression,
                $.parenthesized_expression,
                $.tuple_expression,
                $.implicit_member_expression,
                $.wildcard_expression,
                $.selector_expression,
                $.key_path_string_expression
            ),

        _literal_expression: $ =>
            choice($._literal, $.array_literal, $.dictionary_literal),

        array_literal: $ => seq("[", field("elements", commaSep($.expression)), optional(","), "]"),

        dictionary_literal: $ =>
            choice(
                seq("[", field("elements", commaSep1($.dictionary_literal_item)), optional(","), "]"),
                seq("[", ":", "]")
            ),

        dictionary_literal_item: $ => seq(
            field("key", $.expression),
            ":",
            field("value", $.expression)
        ),


        self: $ => token("self"),

        _self_expression: $ =>
            choice(
                $.self,
                $.self_method_expression,
                $.self_subscript_expression,
                $.self_initializer_expression
            ),

        self_method_expression: $ => seq(field("subject", $.self), ".", field("member", $.identifier)),

        self_subscript_expression: $ =>
            seq(field("subject", $.self), "[", field("arguments", commaSep1($.function_call_argument)), "]"),

        self_initializer_expression: $ => seq(field("subject", $.self), ".", "init"),

        _superclass_expression: $ =>
            choice(
                $.superclass_method_expression,
                $.superclass_subscript_expression,
                $.superclass_initializer_expression
            ),

        super: $ => token("super"),


        superclass_method_expression: $ => seq(field("subject", $.super), ".", field("member", $.identifier)),

        superclass_subscript_expression: $ =>
            seq(field("subject", $.super), "[", field("arguments", commaSep1($.function_call_argument)), "]"),

        superclass_initializer_expression: $ => seq(field("subject", $.super), ".", "init"),

        closure_expression: $ =>
            seq(
                "{",
                field("signature", optional($.closure_signature)),
                choice(
                    optional($._statements),
                    $._statement
                ),
                "}"
            ),

        closure_signature: $ =>
            choice(
                seq(
                    optional($.capture_list),
                    $.closure_parameter_clause,
                    optional("async"),
                    optional("throws"),
                    optional($.function_result),
                    "in"
                ),
                seq($.capture_list, "in")
            ),

        closure_parameter_clause: $ =>
            choice(
                seq("(", ")"),
                seq("(", commaSep1($.closure_parameter), ")"),
                commaSep1($.identifier)
            ),

        closure_parameter: $ =>
            choice(
                seq($.identifier, optional($.type_annotation)),
                seq($.identifier, $.type_annotation, "...")
            ),

        capture_list: $ => seq("[", commaSep1($.capture_list_item), "]"),

        capture_list_item: $ =>
            seq(optional($._capture_specifier), $.expression),

        _capture_specifier: $ =>
            choice("weak", "unowned", "unowned(safe)", "unowned(unsafe)"),

        implicit_member_expression: $ => seq(".", $.identifier),

        parenthesized_expression: $ => seq("(", $.expression, ")"),

        tuple_expression: $ =>
            choice(
                seq("(", ")"),
                seq("(", field("elements", commaSep1($.tuple_element)), ")")
            ),

        tuple_element: $ =>
            choice(
                field("expression", $.expression),
                seq($.identifier, ":", field("expression", $.expression))
            ),

        wildcard_expression: $ => "_",

        selector_expression: $ =>
            choice(
                seq("#selector", "(", $.expression, ")"),
                seq("#selector", "(", "getter:", $.expression, ")"),
                seq("#selector", "(", "setter:", $.expression, ")")
            ),

        key_path_string_expression: $ =>
            seq("#keyPath", "(", $.expression, ")"),

        _postfix_expression: $ =>
            choice(
                $._primary_expression,
                seq($._postfix_expression, alias($.operator, $.postfix_operator)),
                $.function_call_expression,
                $.initializer_expression,
                $.explicit_member_expression,
                $.postfix_self_expression,
                $.subscript_expression,
                $.forced_value_expression,
                $.optional_chaining_expression
            ),

        function_call_expression: $ =>
            seq(
                field("name", $._postfix_expression),
                choice(
                    field("arguments", $.function_call_argument_clause),
                    seq(
                        field("arguments", optional($.function_call_argument_clause)),
                        $.trailing_closures
                    )
                )
            ),


        function_call_argument_clause: $ =>
            choice(seq("(", ")"), seq("(", commaSep1($.function_call_argument), ")")),

        function_call_argument: $ =>
            choice(
                field("argument", $.expression),
                seq(field("identifier", $.identifier), ":", field("argument", $.expression),),
                field("argument", $.operator),
                seq($.identifier, ":", field("argument", $.operator))
            ),

        trailing_closures: $ =>
            seq($.closure_expression, repeat($.labeled_trailing_closure)),

        labeled_trailing_closure: $ =>
            seq($.identifier, ":", $.closure_expression),

        initializer_expression: $ =>
            choice(
                seq($._postfix_expression, ".", "init"),
                seq(
                    $._postfix_expression,
                    ".",
                    "init",
                    "(",
                    repeat1($.argument_name),
                    ")"
                )
            ),

        explicit_member_expression: $ =>
            seq(
                field("subject", $._postfix_expression),
                ".",
                choice(
                    field("member", $.number),
                    field("member", $.identifier),
                    seq(
                        field("member", $.identifier),
                        "(",
                        repeat1($.argument_name),
                        ")"
                    )
                )
            ),

        argument_name: $ => seq($.identifier, ":"),

        postfix_self_expression: $ => seq($._postfix_expression, ".", "self"),

        subscript_expression: $ =>
            seq(
                field("subject", $._postfix_expression),
                "[",
                field("arguments", commaSep1($.function_call_argument)),
                "]"
            ),

        forced_value_expression: $ => seq(field("expression", $._postfix_expression), "!"),

        optional_chaining_expression: $ =>
            prec(PREC.OPTIONAL_TYPE, seq(field("expression", $._postfix_expression), "?")),

        function_result: $ =>
            choice(
                seq("->", repeat($.attribute), $._type),
                seq("->", repeat($.attribute), $._type)
            ),

        //
        // Patterns
        //
        _pattern: $ =>
            choice(
                seq($.wildcard_pattern, optional($.type_annotation)),
                seq($.identifier_pattern, optional($.type_annotation)),
                $.value_binding_pattern,
                seq($.tuple_pattern, optional($.type_annotation)),
                $.enum_case_pattern,
                $.optional_pattern,
                $.type_casting_pattern,
                $.expression
            ),

        wildcard_pattern: $ => "_",

        identifier_pattern: $ => $.identifier,

        value_binding_pattern: $ =>
            choice(seq("var", $._pattern), seq("let", $._pattern)),

        tuple_pattern: $ =>
            seq("(", commaSep($.tuple_pattern_element), ")"),

        tuple_pattern_element: $ =>
            choice($._pattern, seq($.identifier, ":", $._pattern)),

        enum_case_pattern: $ =>
            seq(
                optional($.type_identifier),
                ".",
                alias($.identifier, $.enum_case_name),
                optional($.tuple_pattern)
            ),

        optional_pattern: $ => seq($.identifier_pattern, "?"),

        type_casting_pattern: $ => choice($.is_pattern, $.as_pattern),

        is_pattern: $ => seq("is", $._type),

        as_pattern: $ => seq($._pattern, "as", $._type),

        //
        // Declarations
        //
        _declaration: $ =>
            choice(
                $.import_declaration,
                $.constant_declaration,
                $.variable_declaration,
                $.typealias_declaration,
                $.function_declaration,
                $.enum_declaration,
                $.struct_declaration,
                $.class_declaration,
                $.protocol_declaration,
                $.initializer_declaration,
                $.deinitializer_declaration,
                $.extension_declaration,
                $.subscript_declaration,
                $._operator_declaration,
                $.precedence_group_declaration
            ),

        _code_block: $ => choice(
            seq("{", "}"),
            field("statements", seq("{", $._statements, "}")),
            field("statements", seq("{", $._statement, "}"))
        ),

        import_declaration: $ =>
            seq(
                repeat($.attribute),
                "import",
                optional($._import_kind),
                commaDot1($._import_path_identifier)
            ),

        _import_kind: $ =>
            token(choice(
                "typealias",
                "struct",
                "class",
                "enum",
                "protocol",
                "let",
                "var",
                "func"
            )),

        _import_path_identifier: $ => choice(field("identifier", $.identifier), $.operator),

        constant_declaration: $ =>
            seq(
                repeat($.attribute),
                repeat($._declaration_modifier),
                "let",
                commaSep1(field("pattern_initializer", $.pattern_initializer))
            ),

        pattern_initializer: $ => seq($._pattern, field("value", optional($.initializer))),

        initializer: $ => seq("=", $.expression),

        variable_declaration: $ =>
            choice(
                seq(
                    $.variable_declaration_head,
                    commaSep1(field("pattern_initializer", $.pattern_initializer))
                ),
                seq(
                    $.variable_declaration_head,
                    field("var_name", $.identifier),
                    $.type_annotation,
                    $._code_block
                ),
                seq(
                    $.variable_declaration_head,
                    field("var_name", $.identifier),
                    $.type_annotation,
                    $.getter_setter_block
                ),
                seq(
                    $.variable_declaration_head,
                    field("var_name", $.identifier),
                    $.type_annotation,
                    $.getter_setter_keyword_block
                ),
                seq(
                    $.variable_declaration_head,
                    field("var_name", $.identifier),
                    $.initializer,
                    $.willSet_didSet_block
                ),
                seq(
                    $.variable_declaration_head,
                    field("var_name", $.identifier),
                    $.type_annotation,
                    optional($.initializer),
                    $.willSet_didSet_block
                )
            ),

        variable_declaration_head: $ =>
            seq(
                repeat($.attribute),
                repeat($._declaration_modifier),
                "var"
            ),

        getter_setter_block: $ =>
            choice(
                $._code_block,
                seq("{", $.getter_clause, optional($.setter_clause), "}"),
                seq("{", $.setter_clause, $.getter_clause, "}")
            ),

        getter_clause: $ =>
            seq(
                repeat($.attribute),
                optional($._mutation_modifier),
                "get",
                $._code_block
            ),

        setter_clause: $ =>
            seq(
                repeat($.attribute),
                optional($._mutation_modifier),
                "set",
                optional($.setter_name),
                $._code_block
            ),

        setter_name: $ => seq("(", $.identifier, ")"),

        getter_setter_keyword_block: $ =>
            choice(
                seq(
                    "{",
                    $.getter_keyword_clause,
                    optional($.setter_keyword_clause),
                    "}"
                ),
                seq("{", $.setter_keyword_clause, $.getter_keyword_clause, "}")
            ),

        getter_keyword_clause: $ =>
            seq(repeat($.attribute), optional($._mutation_modifier), "get"),

        setter_keyword_clause: $ =>
            seq(repeat($.attribute), optional($._mutation_modifier), "set"),

        willSet_didSet_block: $ =>
            choice(
                seq("{", $.willSet_clause, optional($.didSet_clause), "}"),
                seq("{", $.didSet_clause, optional($.willSet_clause), "}")
            ),

        willSet_clause: $ =>
            seq(
                repeat($.attribute),
                "willSet",
                optional($.setter_name),
                $._code_block
            ),

        didSet_clause: $ =>
            seq(
                repeat($.attribute),
                "didSet",
                optional($.setter_name),
                $._code_block
            ),

        typealias_declaration: $ =>
            seq(
                repeat($.attribute),
                optional($._access_level_modifier),
                "typealias",
                $._typealias_name,
                optional($.generic_parameter_clause),
                $.typealias_assignment
            ),

        _typealias_name: $ => $.identifier,

        typealias_assignment: $ => seq("=", $._type),

        function_declaration: $ =>
            seq(
                $.function_head,
                field("name", $.function_name),
                optional($.generic_parameter_clause),
                $._function_signature,
                optional($.generic_where_clause),
                $._code_block
            ),

        function_head: $ =>
            seq(
                repeat($.attribute),
                repeat($._declaration_modifier),
                "func"
            ),

        function_name: $ => choice($.identifier, $.operator),

        _function_signature: $ =>
            choice(
                seq(
                    $._parameter_clause,
                    optional("async"),
                    optional("throws"),
                    optional($.function_result)
                ),
                seq($._parameter_clause, "rethrows", optional($.function_result))
            ),

        _parameter_clause: $ =>
            choice(
                seq("(", ")"),
                seq("(", commaSep1(field("parameters", $.parameter)), ")")
            ),

        parameter: $ =>
            choice(
                seq(
                    optional(alias($.identifier, $.external_parameter_name)),
                    field("identifier", $.identifier),
                    $.type_annotation,
                    optional($._default_argument_clause)
                ),
                seq(
                    optional(alias($.identifier, $.external_parameter_name)),
                    field("identifier", $.identifier),
                    $.type_annotation
                ),
                seq(
                    optional(alias($.identifier, $.external_parameter_name)),
                    field("identifier", $.identifier),
                    $.type_annotation,
                    "..."
                )
            ),

        _default_argument_clause: $ => seq("=", field("default_value", $.expression)),

        enum_declaration: $ =>
            choice(
                seq(
                    repeat($.attribute),
                    optional($._access_level_modifier),
                    $.union_style_enum
                ),
                seq(
                    repeat($.attribute),
                    optional($._access_level_modifier),
                    $.raw_value_style_enum
                )
            ),

        union_style_enum: $ =>
            seq(
                optional("indirect"),
                "enum",
                alias($.identifier, $.enum_name),
                optional($.generic_parameter_clause),
                optional($.type_inheritance_clause),
                optional($.generic_where_clause),
                "{",
                repeat($.union_style_enum_member),
                "}"
            ),

        union_style_enum_member: $ =>
            choice(
                $._declaration,
                $.union_style_enum_case_clause,
                $._compiler_control_statement
            ),

        union_style_enum_case_clause: $ =>
            seq(
                repeat($.attribute),
                optional("indirect"),
                "case",
                commaSep1($.union_style_enum_case)
            ),

        union_style_enum_case: $ =>
            seq(alias($.identifier, $.enum_case_name), optional($.tuple_type)),

        raw_value_style_enum: $ =>
            seq(
                "enum",
                alias($.identifier, $.enum_name),
                optional($.generic_parameter_clause),
                $.type_inheritance_clause,
                optional($.generic_where_clause),
                "{",
                repeat1($.raw_value_style_enum_member),
                "}"
            ),

        raw_value_style_enum_member: $ =>
            choice(
                $._declaration,
                $.raw_value_style_enum_case_clause,
                $._compiler_control_statement
            ),

        raw_value_style_enum_case_clause: $ =>
            seq(
                repeat($.attribute),
                "case",
                commaSep1($.raw_value_style_enum_case)
            ),

        raw_value_style_enum_case: $ =>
            seq(alias($.identifier, $.enum_case_name), optional($.raw_value_assignment)),

        raw_value_assignment: $ => seq("=", $._raw_value_literal),

        _raw_value_literal: $ => $._literal,

        struct_declaration: $ =>
            seq(
                repeat($.attribute),
                optional($._access_level_modifier),
                "struct",
                field("struct_name", $.identifier),
                optional($.generic_parameter_clause),
                field("type_inheritance_clause", optional($.type_inheritance_clause)),
                optional($.generic_where_clause),
                field("body", $.struct_body)
            ),

        struct_body: $ => seq("{", repeat($._struct_member), "}"),

        _struct_member: $ =>
            choice($._declaration, $._compiler_control_statement),

        class_declaration: $ =>
            choice(
                seq(
                    repeat($.attribute),
                    optional($._access_level_modifier),
                    optional("final"),
                    choice("class", "actor"),
                    field("class_name", $.identifier),
                    optional($.generic_parameter_clause),
                    field("type_inheritance_clause", optional($.type_inheritance_clause)),
                    optional($.generic_where_clause),
                    field("body", $.class_body)
                ),
                seq(
                    repeat($.attribute),
                    "final",
                    optional($._access_level_modifier),
                    choice("class", "actor"),
                    field("class_name", $.identifier),
                    optional($.generic_parameter_clause),
                    field("type_inheritance_clause", optional($.type_inheritance_clause)),
                    optional($.generic_where_clause),
                    field("body", $.class_body)
                )
            ),

        class_body: $ => seq("{", repeat($._class_member), "}"),

        _class_member: $ =>
            choice($._declaration, $._compiler_control_statement),

        protocol_declaration: $ =>
            seq(
                repeat($.attribute),
                optional($._access_level_modifier),
                "protocol",
                field("protocol_name", $.identifier),
                field("type_inheritance_clause", optional($.type_inheritance_clause)),
                optional($.generic_where_clause),
                field("body", $.protocol_body)
            ),

        protocol_body: $ => seq("{", repeat($._protocol_member), "}"),

        _protocol_member: $ =>
            choice($._protocol_member_declaration, $._compiler_control_statement),

        _protocol_member_declaration: $ =>
            choice(
                $.protocol_property_declaration,
                $.protocol_method_declaration,
                $.protocol_initializer_declaration,
                $.protocol_subscript_declaration,
                $.protocol_associated_type_declaration,
                $.typealias_declaration
            ),

        protocol_property_declaration: $ =>
            seq(
                $.variable_declaration_head,
                field("identifier", $.identifier),
                $.type_annotation,
                $.getter_setter_keyword_block
            ),

        protocol_method_declaration: $ =>
            seq(
                $.function_head,
                field("name", $.function_name),
                optional($.generic_parameter_clause),
                $._function_signature,
                optional($.generic_where_clause)
            ),

        protocol_initializer_declaration: $ =>
            choice(
                seq(
                    $._initializer_head,
                    optional($.generic_parameter_clause),
                    $._parameter_clause,
                    optional("async"),
                    optional("throws"),
                    optional($.generic_where_clause)
                ),
                seq(
                    $._initializer_head,
                    optional($.generic_parameter_clause),
                    $._parameter_clause,
                    "rethrows",
                    optional($.generic_where_clause)
                )
            ),

        protocol_subscript_declaration: $ =>
            seq(
                $.subscript_head,
                $.subscript_result,
                optional($.generic_where_clause),
                $.getter_setter_keyword_block
            ),

        protocol_associated_type_declaration: $ =>
            seq(
                repeat($.attribute),
                optional($._access_level_modifier),
                "associatedtype",
                $._typealias_name,
                optional($.type_inheritance_clause),
                optional($.typealias_assignment),
                optional($.generic_where_clause)
            ),

        initializer_declaration: $ =>
            choice(
                seq(
                    $._initializer_head,
                    optional($.generic_parameter_clause),
                    $._parameter_clause,
                    optional("async"),
                    optional("throws"),
                    optional($.generic_where_clause),
                    $._initializer_body
                ),
                seq(
                    $._initializer_head,
                    optional($.generic_parameter_clause),
                    $._parameter_clause,
                    "rethrows",
                    optional($.generic_where_clause),
                    $._initializer_body
                )
            ),

        _initializer_head: $ =>
            choice(
                seq(
                    repeat($.attribute),
                    repeat($._declaration_modifier),
                    field("keyword", $.init)
                ),
                seq(
                    repeat($.attribute),
                    repeat($._declaration_modifier),
                    field("keyword", $.init),
                    "?"
                ),
                seq(
                    repeat($.attribute),
                    repeat($._declaration_modifier),
                    field("keyword", $.init),
                    "!"
                )
            ),

        init: $ => token("init"),

        _initializer_body: $ => $._code_block,

        deinitializer_declaration: $ =>
            seq(repeat($.attribute), field("keyword", $.deinit), $._code_block),

        deinit: $ => token("deinit"),

        extension_declaration: $ =>
            seq(
                repeat($.attribute),
                optional($._access_level_modifier),
                "extension",
                field("name", $.type_identifier),
                field("type_inheritance_clause", optional($.type_inheritance_clause)),
                optional($.generic_where_clause),
                field("body", $.extension_body)
            ),

        extension_body: $ => seq("{", repeat($._extension_member), "}"),

        _extension_member: $ =>
            choice($._declaration, $._compiler_control_statement),

        subscript_declaration: $ =>
            seq(
                $.subscript_head,
                $.subscript_result,
                optional($.generic_where_clause),
                choice(
                    $._code_block,
                    $.getter_setter_block,
                    $.getter_setter_keyword_block
                )
            ),

        subscript_head: $ =>
            seq(
                repeat($.attribute),
                repeat($._declaration_modifier),
                "subscript",
                optional($.generic_parameter_clause),
                $._parameter_clause
            ),

        subscript_result: $ => seq("->", repeat($.attribute), $._type),

        _operator_declaration: $ =>
            choice(
                $.prefix_operator_declaration,
                $.postfix_operator_declaration,
                $.infix_operator_declaration
            ),

        prefix_operator_declaration: $ =>
            seq("prefix", "operator", $.operator),

        postfix_operator_declaration: $ =>
            seq("postfix", "operator", $.operator),

        infix_operator_declaration: $ =>
            seq(
                "infix",
                "operator",
                $.operator,
                optional($.infix_operator_group)
            ),

        infix_operator_group: $ => seq(":", alias($.identifier, $.precedence_group_name)),

        precedence_group_declaration: $ =>
            seq(
                "precedencegroup",
                alias($.identifier, $.precedence_group_name),
                "{",
                repeat($.precedence_group_attribute),
                "}"
            ),

        precedence_group_attribute: $ =>
            choice(
                $.precedence_group_relation,
                $.precedence_group_assignment,
                $.precedence_group_associativity
            ),

        precedence_group_relation: $ =>
            choice(
                seq("higherThan", ":", commaSep1(alias($.identifier, $.precedence_group_name))),
                seq("lowerThan", ":", commaSep1(alias($.identifier, $.precedence_group_name)))
            ),

        precedence_group_assignment: $ => seq("assignment", ":", $._literal),

        precedence_group_associativity: $ =>
            choice(
                seq("associativity", ":", "left"),
                seq("associativity", ":", "right"),
                seq("associativity", ":", "none")
            ),

        _declaration_modifier: $ =>
            choice(
                "actor",
                "class",
                "convenience",
                "dynamic",
                "final",
                "infix",
                "lazy",
                "optional",
                "override",
                "postfix",
                "prefix",
                "required",
                "static",
                "unowned",
                seq("unowned", "(", "safe", ")"),
                seq("unowned", "(", "unsafe", ")"),
                "weak",
                $._access_level_modifier,
                $._mutation_modifier
            ),

        _access_level_modifier: $ =>
            choice(
                "private",
                seq("private", "(", "set", ")"),
                "fileprivate",
                seq("fileprivate", "(", "set", ")"),
                "internal",
                seq("internal", "(", "set", ")"),
                "public",
                seq("public", "(", "set", ")"),
                "open",
                seq("open", "(", "set", ")")
            ),

        _mutation_modifier: $ => choice("mutating", "nonmutating"),

        //
        // Literal
        //
        _literal: $ =>
            choice($.boolean_literal, $.string_literal, $.number, $.nil_literal),

        boolean_literal: $ => choice("true", "false"),

        string_literal: $ => {
            const double_quote_string = choice(seq('"', double_quote_chars(), '"'), seq('"""\n', double_quote_chars(), '"""'))
            return token(double_quote_string)
        },

        number: $ => {
            const decimal_digits = /\d(_?\d)*/;
            const signed_operators = optional(/[-\+]/);
            const signed_integer = seq(signed_operators, decimal_digits);
            const decimal_integer_literal = seq(
                choice(
                    "0",
                    seq(
                        optional("0"),
                        /[1-9]/,
                        optional(seq(optional("_"), decimal_digits))
                    )
                )
            );
            const hex_literal = seq(
                choice("0x", "0X"),
                /[\da-fA-F](_?[\da-fA-F])*/
            );

            const exponent_part = seq(choice("e", "E"), signed_integer);
            const binary_literal = seq(choice("0b", "0B"), /[0-1](_?[0-1])*/);
            const octal_literal = seq(choice("0o", "0O"), /[0-7](_?[0-7])*/);
            const bigint_literal = seq(
                choice(
                    hex_literal,
                    binary_literal,
                    octal_literal,
                    decimal_digits
                ),
                "n"
            );

            const decimal_literal = choice(
                seq(
                    signed_operators,
                    decimal_integer_literal,
                    ".",
                    optional(decimal_digits),
                    optional(exponent_part)
                ),
                seq(
                    signed_operators,
                    ".",
                    decimal_digits,
                    optional(exponent_part)
                ),
                seq(signed_operators, decimal_integer_literal, exponent_part),
                seq(signed_operators, decimal_digits)
            );

            return token(
                choice(
                    hex_literal,
                    decimal_literal,
                    binary_literal,
                    octal_literal,
                    bigint_literal
                )
            );
        },

        nil_literal: $ => token("nil"),

        //
        // Types
        //
        _type: $ =>
            choice(
                $.function_type,
                $.array_type,
                $.dictionary_type,
                $.type_identifier,
                $.tuple_type,
                $.optional_type,
                $.implicitly_unwrapped_optional_type,
                $.protocol_composition_type,
                $.opaque_type,
                $.metatype_type,
                $.any_type,
                $.self_type,
                seq("(", $._type, ")")
            ),

        type_annotation: $ =>
            seq(":", repeat($.attribute), optional("inout"), $._type),

        type_identifier: $ =>
            choice(
                seq(field("identifier", $.identifier), optional($.generic_argument_clause)),
                seq(
                    $.identifier,
                    optional($.generic_argument_clause),
                    ".",
                    field("type_identifier", $.type_identifier)
                )
            ),

        tuple_type: $ =>
            seq(
                "(",
                commaSep($.tuple_type_element),
                ")"
            ),

        tuple_type_element: $ =>
            choice(seq($.identifier, $.type_annotation), $._type),

        function_type: $ =>
            seq(
                repeat($.attribute),
                $.function_type_argument_clause,
                optional("async"),
                optional("throws"),
                "->",
                $._type
            ),

        function_type_argument_clause: $ =>
            choice(
                seq("(", ")"),
                seq("(", commaSep1($.function_type_argument), optional("..."), ")")
            ),

        function_type_argument: $ =>
            choice(
                seq(repeat($.attribute), optional("inout"), $._type),
                seq($.identifier, optional($.identifier), $.type_annotation)
            ),

        array_type: $ => seq("[", $._type, "]"),

        dictionary_type: $ => seq("[", $._type, ":", $._type, "]"),

        optional_type: $ => prec(PREC.OPTIONAL_TYPE, seq($._type, "?")),

        implicitly_unwrapped_optional_type: $ => prec(PREC.OPTIONAL_TYPE, seq($._type, "!")),

        protocol_composition_type: $ =>
            prec(PREC.PROTOCOL_COMPOSITION_TYPE, seq($.type_identifier, "&", $.protocol_composition_continuation)),

        protocol_composition_continuation: $ =>
            choice($.type_identifier, $.protocol_composition_type),

        opaque_type: $ => seq("some", $._type),

        metatype_type: $ =>
            prec(PREC.METATYPE_TYPE, choice(seq($._type, ".", "Type"), seq($._type, ".", "Protocol"))),

        any_type: $ => "Any",

        self_type: $ => "Self",

        type_inheritance_clause: $ => seq(":", commaSep1($.type_identifier)),

        generic_argument_clause: $ => seq("<", commaSep1($.generic_argument), ">"),

        generic_argument: $ => $._type,

        generic_parameter_clause: $ =>
            seq("<", commaSep1($.generic_parameter), ">"),

        generic_parameter: $ =>
            choice(
                $.identifier,
                seq($.identifier, ":", $.type_identifier),
                seq($.identifier, ":", $.protocol_composition_type)
            ),

        generic_where_clause: $ => seq("where", commaSep1($._requirement)),

        _requirement: $ =>
            choice($.conformance_requirement, $.same_type_requirement),

        conformance_requirement: $ =>
            choice(
                seq($.type_identifier, ":", $.type_identifier),
                seq($.type_identifier, ":", $.protocol_composition_type)
            ),

        same_type_requirement: $ => seq($.type_identifier, "==", $._type),

        attribute: $ =>
            seq("@", alias($.identifier, $.attribute_name)),

        //
        // Lexical Structure
        //
        identifier: $ => {
            const _identifier_head = /[A-Za-z_$]/;
            const _identifier_characters = repeat(
                choice(_identifier_head, /[0-9]/)
            );

            return token(
                choice(
                    seq(_identifier_head, optional(_identifier_characters)),
                    seq(
                        "`",
                        _identifier_head,
                        optional(_identifier_characters),
                        "`"
                    )
                )
            );
        },

        operator: $ => {
            const _operator_head = choice(
                "/",
                "=",
                "-",
                "+",
                "!",
                "*",
                "%",
                "<",
                ">",
                "&",
                "|",
                "^",
                "~",
                "?",
            );
            return token(repeat1(_operator_head));
        },

        comment: $ => token(prec(PREC.COMMENT, choice(
            seq("//", /.*/),
            seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
        ))),
    },
});

function commaDot1(rule) {
    return seq(rule, repeat(seq(".", rule)));
}

function commaSep1(rule) {
    return seq(rule, repeat(seq(",", rule)));
}

function commaSep(rule) {
    return optional(commaSep1(rule));
}

function double_quote_chars() {
    const dq_simple_escapes = /\\"|\\\\|\\\$|\\e|\\f|\\n|\\r|\\t|\\v/
    const octal_digit = /[0-7]/
    const dq_octal_escapes = seq('\\', octal_digit, optional(octal_digit), optional(octal_digit))
    const hex_digit = /\d|a-f|A-F/
    const dq_hex_escapes = seq(
        /\\[xX]/,
        hex_digit,
        optional(hex_digit)
    )

    const dq_unicode_escapes = seq('\\u{', repeat1(hex_digit), '}')
    const dq_escapes = choice(dq_simple_escapes, dq_octal_escapes, dq_hex_escapes, dq_unicode_escapes)
    return repeat(choice(dq_escapes, /[^"\\]|\\[^"\\$efnrtv0-7]/))
}
