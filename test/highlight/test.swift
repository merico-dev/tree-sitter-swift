import Foundation

struct ABC: Codable {
// <- keyword
//     ^ type
//          ^ type
//                  ^ punctuation.bracket

    let a: [String] = ["Hello", "World!"]
    // <- keyword
    //  ^ variable
    //   ^ punctuation.delimiter
    //       ^ type
    //                  ^ string

    let b: Dictionary<String, Int> = ["One": 1, "Two": 2]
    // <- keyword
    //  ^ variable

    var c = true
    // <- keyword
    //  ^ variable
    //      ^ constant.builtin

    var d: (String, Int) = ("", 0x123)
    // <- keyword
    //  ^ variable
    //      ^ type
    //              ^ type
    //                      ^ string
    //                          ^ number
}

enum A: UInt32 {
// <- keyword
//   ^ type
//      ^ type
    case a
    case b = 1
    //       ^ number
    case c = 2
    //   ^ property
}


func abc(def ghi: String, otherParameter: Bool) -> ABC {
// <- keyword.function
//   ^ function
//       ^ identifier
//           ^ property
//                ^ type
//                        ^ property
//                                        ^ type
//                                                 ^ type

    return ABC(a: ["String 1", "String 2"], b: ["Three": 3, "Four": 4], c: otherParameter)
    // <- keyword
    //     ^ function
    //         ^ property
    //              ^ string
    //                                      ^ property
    //                                                                  ^ property
    //                                                                      ^ identifier
}

for i in [0, 1, 2, 3] {
// <- keyword
//  ^ variable
//    ^ keyword
//        ^ number
//                    ^ punctuation.bracket
    print(i)
    // ^ function
    //    ^ identifier

    if i == 2 { break }
    // <- keyword
    // ^ identifier
    //   ^ operator
    //      ^ number
    //          ^ keyword
}

if "Hello" != "World" {
// <- keyword
//  ^ string
//         ^ operator
//             ^ string
//                    ^ punctuation.bracket
    exit(0)
    // <- function
    //   ^ number
} else if a == b {
// ^ keyword
//     ^ keyword
//        ^ identifier
//          ^ operator
//             ^ identifier
//               ^ punctuation.bracket
    exit(1)
    // ^ function
    //   ^ number
}


