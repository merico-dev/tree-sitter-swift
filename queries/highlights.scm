; Keywords
[
	"associatedtype"
	"actor"
	"await"
	"async"
	"class"
;	"deinit"
	"enum"
	"extension"
	"fileprivate"
	;"func"
	"import"
	"inout"
	"internal"
	"let"
	"open"
	"operator"
	"private"
	"protocol"
	"public"
	"rethrows"
	"static"
	"struct"
	"subscript"
	"typealias"
	"var"
	"break"
	"case"
	"continue"
	"default"
	"defer"
	"do"
	"else"
;	"fallthrough"
	"for"
	"guard"
	"if"
	"in"
	"repeat"
	"return"
	"switch"
	"where"
	"while"
	"as"
;	"Any"
	"catch"
	"is"
;	"super"
;	"Self"
	"throw"
	"throws"
	"try"
	"associativity"
	"convenience"
	"dynamic"
	"didSet"
	"final"
	"get"
	"infix"
	"indirect"
	"lazy"
	"left"
	"mutating"
	"none"
	"nonmutating"
	"optional"
	"override"
	"postfix"
;	"precedence"
	"prefix"
	"Protocol"
	"required"
	"right"
	"set"
	"Type"
	"unowned"
	"weak"
	"willSet"
	"#selector"
	"#keyPath"
	"#warning"
	"#error"
	"#available"
	"#if"
	"#elseif"
	"#else"
	"#endif"
] @keyword

"init" @constructor

[
	"true"
	"false"
	"self"
	(nil_literal)
] @constant.builtin

[
;  "-"
;  "-="
  "!"
;  "!="
  "..."
  "*"
;  "*="
;  "/"
;  "/="
  "&"
  "&&"
;  "&="
;  "%"
;  "%="
;  "^"
;  "^="
;  "+"
;  "++"
;  "+="
;  "<"
;  "<<"
;  "<="
  "="
  "=="
;  ">"
  ">="
;  ">>"
;  "|"
;  "|="
  "||"
] @operator

; Punctuation and Delimiters
[
	"{"
	"}"
	"("
	")"
] @punctuation.bracket

[
	","
	";"
	":"
] @punctuation.delimiter

(comment) @comment

; Types and Literals
(type_identifier identifier: (identifier) @type type_identifier: (type_identifier)?)
(number) @number
(string_literal) @string
(operator) @operator
(any_type) @type

; Attributes
(attribute_name) @type
(attribute) @attribute

; Imports
(import_declaration identifier: (identifier) @type)

; Variables
(variable_declaration var_name: (identifier) @variable)
(parameter identifier: (identifier) @property)
(identifier_pattern) @property

; Functions

(function_head) @keyword.function
(function_name (identifier) @function)
(external_parameter_name) @identifier
(function_call_argument identifier: (identifier) @property)
(function_call_expression name: (identifier) @function)
(function_call_expression name: (explicit_member_expression member: (identifier) @function))
(function_call_expression name: (implicit_member_expression (identifier) @function))

(binary_expression left: (expression postfix_expression: (identifier) @identifier))
(expression postfix_expression: (identifier) @identifier)
(implicit_member_expression (identifier) @identifier)

(explicit_member_expression subject: (identifier) @identifier member: (identifier) @identifier)
(explicit_member_expression subject: (explicit_member_expression) member: (identifier) @identifier)
(explicit_member_expression subject: (function_call_expression) member: (identifier) @identifier)
(explicit_member_expression subject: (forced_value_expression) member: (identifier) @identifier)
(explicit_member_expression subject: (implicit_member_expression) member: (identifier) @identifier)
(explicit_member_expression subject: (optional_chaining_expression) member: (identifier) @identifier)
(explicit_member_expression subject: (self_method_expression) member: (identifier) @identifier)
(explicit_member_expression subject: (self) member: (identifier) @identifier)
(explicit_member_expression subject: (subscript_expression) member: (identifier) @identifier)

(self_method_expression subject: (self) @variable member: (identifier) @identifier)

; Tuples
(tuple_element (identifier) @property)
(tuple_pattern_element (identifier) @property)
(tuple_type_element (identifier) @type)

; Enums
(enum_case_name) @property
(enum_name) @type

; Subscripts
(subscript_expression subject: (identifier) @identifier)

; Structs and Classes
(struct_declaration struct_name: (identifier) @type)
(class_declaration class_name: (identifier) @type)
(deinit) @keyword

; Protocols
(protocol_declaration protocol_name: (identifier) @type)
(protocol_associated_type_declaration (identifier) @type)

; Generics
(generic_parameter (identifier) @type)

; Type Aliases
(typealias_declaration (identifier) @type)

; Inout
(in_out_expression identifier: (identifier) @identifier)

; Optionals
(forced_value_expression expression: (identifier) @identifier)
(optional_chaining_expression expression: (identifier) @identifier)

; Self Expression
(postfix_self_expression (identifier) @identifier)

; Wildcard Expression
(wildcard_expression) @keyword

; Super Class Expression
(superclass_method_expression subject: (super) @keyword)
(superclass_subscript_expression subject: (super) @keyword)
(superclass_initializer_expression subject: (super) @keyword)

; Label, Break, Continue, Fallthrough Statements
(labeled_statement (identifier) @identifier)
(break_statement (identifier)? @identifier)
(continue_statement (identifier)? @identifier)
(fallthrough_statement) @keyword

; Compilation Condition
(compilation_condition) @identifier
