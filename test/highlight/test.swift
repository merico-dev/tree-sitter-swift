import Foundation

struct ABC: Codable {
// <- keyword
//     ^ type
//          ^ type
//                  ^ punctuation.bracket

    let a: [String] = ["Hello", "World!"]
    // <- keyword
    //  ^ property
    //   ^ punctuation.delimiter
    //       ^ type
    //                  ^ string

    let b: Dictionary<String, Int> = ["One": 1, "Two": 2]
    var c: Bool = true
    var d: (String, Int) = ("", 0x123)
}
// -> punctuation.bracket

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
